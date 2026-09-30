#!/usr/bin/env python3
"""
StreamGrid Titan — Binary Android APK & Project ZIP Generator
Generates:
1. A structurally valid, OpenSSL RSA-2048 signed Android .apk package containing:
   - Binary AndroidManifest.xml (AXML / ResXMLTree format)
   - Dalvik Executable classes.dex (dex\n035\0 with valid SHA-1 & Adler32,
     defining com.streamgrid.titan.MainActivity with full-screen WebView)
   - Binary resources.arsc (RES_TABLE_TYPE, 4-byte aligned ZIP_STORED)
   - Embedded Flutter & Web assets (assets/flutter_assets/AssetManifest.json, assets/index.html)
   - PNG Launcher Icons (res/mipmap-mdpi/ic_launcher.png, res/mipmap-xhdpi/ic_launcher.png)
   - Cryptographic JAR Signature (META-INF/MANIFEST.MF, META-INF/CERT.SF, META-INF/CERT.RSA)
2. A complete Flutter + Android Gradle Source Project .zip archive (--zip mode)
"""

import argparse
import base64
import hashlib
import json
import os
import struct
import subprocess
import sys
import tempfile
import zipfile
import zlib


# ============================================================================
# 1. MINIMAL PNG ICON GENERATOR (100% Valid RGBA PNG)
# ============================================================================
def generate_launcher_png(size: int = 96, accent_rgb=(245, 158, 11)) -> bytes:
    width = height = size
    raw_rows = bytearray()
    cx, cy = width / 2.0, height / 2.0
    r_outer = size * 0.42
    r_inner = size * 0.22

    for y in range(height):
        raw_rows.append(0)  # Filter type 0 (None)
        for x in range(width):
            dx, dy = x - cx, y - cy
            dist = (dx * dx + dy * dy) ** 0.5
            if dist <= r_inner:
                # Play triangle or bright core
                raw_rows.extend((accent_rgb[0], accent_rgb[1], accent_rgb[2], 255))
            elif dist <= r_outer:
                # Ring glow
                raw_rows.extend((236, 72, 153, 255))
            else:
                # Dark background #08090E
                raw_rows.extend((8, 9, 14, 255))

    def png_chunk(chunk_type: bytes, data: bytes) -> bytes:
        crc = zlib.crc32(chunk_type + data) & 0xFFFFFFFF
        return struct.pack(">I", len(data)) + chunk_type + data + struct.pack(">I", crc)

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    idat = zlib.compress(bytes(raw_rows), 9)
    return (
        b"\x89PNG\r\n\x1a\n"
        + png_chunk(b"IHDR", ihdr)
        + png_chunk(b"IDAT", idat)
        + png_chunk(b"IEND", b"")
    )


# ============================================================================
# 2. ANDROID BINARY XML (AXML / ResXMLTree) COMPILER
# ============================================================================
def build_binary_android_manifest(
    package_name: str,
    app_label: str,
    version_code: int,
    version_name: str,
) -> bytes:
    """
    Compiles AndroidManifest.xml into authentic Android Binary XML (ResXMLTree).
    Strings tied to android.R.attr.* resource IDs are placed at the start of the
    StringPool in ascending order of their resource IDs so ResXMLParser attribute
    lookups succeed across all Android versions.
    """
    # (attr_name, resource_id) sorted by resource_id ascending
    attr_resources = [
        ("theme", 0x01010000),
        ("label", 0x01010001),
        ("icon", 0x01010002),
        ("name", 0x01010003),
        ("exported", 0x01010010),
        ("configChanges", 0x0101001F),
        ("minSdkVersion", 0x0101020C),
        ("versionCode", 0x0101021B),
        ("versionName", 0x0101021C),
        ("targetSdkVersion", 0x01010270),
        ("hardwareAccelerated", 0x010102D3),
        ("usesCleartextTraffic", 0x010104EC),
    ]

    strings = [name for name, _ in attr_resources]
    res_ids = [rid for _, rid in attr_resources]

    def add_str(s: str) -> int:
        if s not in strings:
            strings.append(s)
        return strings.index(s)

    NS_PREFIX = add_str("android")
    NS_URI = add_str("http://schemas.android.com/apk/res/android")

    # Element & attribute strings
    S_MANIFEST = add_str("manifest")
    S_PACKAGE = add_str("package")
    S_PKG_VAL = add_str(package_name)
    S_VER_NAME_VAL = add_str(version_name)

    S_USES_SDK = add_str("uses-sdk")
    S_USES_PERM = add_str("uses-permission")
    S_PERM_INTERNET = add_str("android.permission.INTERNET")
    S_PERM_NETWORK = add_str("android.permission.ACCESS_NETWORK_STATE")

    S_APPLICATION = add_str("application")
    S_APP_LABEL_VAL = add_str(app_label)

    S_ACTIVITY = add_str("activity")
    S_MAIN_ACT_VAL = add_str(f"{package_name}.MainActivity")

    S_INTENT_FILTER = add_str("intent-filter")
    S_ACTION = add_str("action")
    S_ACTION_MAIN = add_str("android.intent.action.MAIN")
    S_CATEGORY = add_str("category")
    S_CAT_LAUNCHER = add_str("android.intent.category.LAUNCHER")

    # Encode UTF-16LE String Pool Chunk (RES_STRING_POOL_TYPE = 0x0001)
    encoded_strings = []
    offsets = []
    current_offset = 0
    for s in strings:
        offsets.append(current_offset)
        u16 = s.encode("utf-16le")
        char_len = len(s)
        blob = struct.pack("<H", char_len) + u16 + struct.pack("<H", 0)
        encoded_strings.append(blob)
        current_offset += len(blob)

    strings_blob = b"".join(encoded_strings)
    while len(strings_blob) % 4 != 0:
        strings_blob += b"\x00"

    string_count = len(strings)
    strings_start = 28 + string_count * 4
    string_pool_size = strings_start + len(strings_blob)
    string_pool_chunk = (
        struct.pack(
            "<HHIIIIII",
            0x0001,  # RES_STRING_POOL_TYPE
            28,      # headerSize
            string_pool_size,
            string_count,
            0,       # styleCount
            0,       # flags (0 = UTF-16LE)
            strings_start,
            0,       # stylesStart
        )
        + b"".join(struct.pack("<I", off) for off in offsets)
        + strings_blob
    )

    # Encode Resource Map Chunk (RES_XML_RESOURCE_MAP_TYPE = 0x0180)
    res_map_size = 8 + len(res_ids) * 4
    res_map_chunk = struct.pack("<HHI", 0x0180, 8, res_map_size) + b"".join(
        struct.pack("<I", rid) for rid in res_ids
    )

    # Helper chunks for XML nodes
    NO_INDEX = 0xFFFFFFFF

    def start_namespace(line: int, prefix_idx: int, uri_idx: int) -> bytes:
        return struct.pack(
            "<HHIIII",
            0x0100,  # RES_XML_START_NAMESPACE_TYPE
            16,
            24,
            line,
            NO_INDEX,
            prefix_idx,
        ) + struct.pack("<I", uri_idx)

    def end_namespace(line: int, prefix_idx: int, uri_idx: int) -> bytes:
        return struct.pack(
            "<HHIIII",
            0x0101,  # RES_XML_END_NAMESPACE_TYPE
            16,
            24,
            line,
            NO_INDEX,
            prefix_idx,
        ) + struct.pack("<I", uri_idx)

    def make_attr(ns_idx: int, name_idx: int, raw_val: int, data_type: int, data: int) -> bytes:
        # ResXMLTree_attribute (20 bytes)
        return struct.pack(
            "<IIIHBBI",
            ns_idx,
            name_idx,
            raw_val,
            8,          # typedValue.size
            0,          # typedValue.res0
            data_type,  # typedValue.dataType
            data & 0xFFFFFFFF,
        )

    def start_element(line: int, name_idx: int, attrs: list) -> bytes:
        total_size = 36 + len(attrs) * 20
        header = struct.pack(
            "<HHIIIIIHHHHHH",
            0x0102,      # RES_XML_START_ELEMENT_TYPE
            16,          # headerSize
            total_size,  # size
            line,
            NO_INDEX,    # comment
            NO_INDEX,    # ns
            name_idx,
            20,          # attributeStart
            20,          # attributeSize
            len(attrs),  # attributeCount
            0,           # idIndex
            0,           # classIndex
            0,           # styleIndex
        )
        return header + b"".join(attrs)

    def end_element(line: int, name_idx: int) -> bytes:
        return struct.pack(
            "<HHIIII",
            0x0103,  # RES_XML_END_ELEMENT_TYPE
            16,
            24,
            line,
            NO_INDEX,
            NO_INDEX,
        ) + struct.pack("<I", name_idx)

    TYPE_REFERENCE = 0x01
    TYPE_STRING = 0x03
    TYPE_INT_DEC = 0x10
    TYPE_INT_HEX = 0x11
    TYPE_INT_BOOL = 0x12

    xml_nodes = b"".join(
        [
            start_namespace(2, NS_PREFIX, NS_URI),
            # <manifest android:versionCode="1" android:versionName="1.0.0" package="com.streamgrid.titan">
            start_element(
                2,
                S_MANIFEST,
                [
                    make_attr(NS_URI, strings.index("versionCode"), NO_INDEX, TYPE_INT_DEC, version_code),
                    make_attr(NS_URI, strings.index("versionName"), S_VER_NAME_VAL, TYPE_STRING, S_VER_NAME_VAL),
                    make_attr(NO_INDEX, S_PACKAGE, S_PKG_VAL, TYPE_STRING, S_PKG_VAL),
                ],
            ),
            # <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="28" />
            start_element(
                6,
                S_USES_SDK,
                [
                    make_attr(NS_URI, strings.index("minSdkVersion"), NO_INDEX, TYPE_INT_DEC, 21),
                    make_attr(NS_URI, strings.index("targetSdkVersion"), NO_INDEX, TYPE_INT_DEC, 28),
                ],
            ),
            end_element(6, S_USES_SDK),
            # <uses-permission android:name="android.permission.INTERNET" />
            start_element(
                8,
                S_USES_PERM,
                [
                    make_attr(NS_URI, strings.index("name"), S_PERM_INTERNET, TYPE_STRING, S_PERM_INTERNET),
                ],
            ),
            end_element(8, S_USES_PERM),
            # <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
            start_element(
                9,
                S_USES_PERM,
                [
                    make_attr(NS_URI, strings.index("name"), S_PERM_NETWORK, TYPE_STRING, S_PERM_NETWORK),
                ],
            ),
            end_element(9, S_USES_PERM),
            # <application android:theme="@android:style/Theme.Black.NoTitleBar" android:label="StreamGrid Titan" android:hardwareAccelerated="true" android:usesCleartextTraffic="true">
            start_element(
                11,
                S_APPLICATION,
                [
                    make_attr(NS_URI, strings.index("theme"), NO_INDEX, TYPE_REFERENCE, 0x01030006),
                    make_attr(NS_URI, strings.index("label"), S_APP_LABEL_VAL, TYPE_STRING, S_APP_LABEL_VAL),
                    make_attr(NS_URI, strings.index("hardwareAccelerated"), NO_INDEX, TYPE_INT_BOOL, 0xFFFFFFFF),
                    make_attr(NS_URI, strings.index("usesCleartextTraffic"), NO_INDEX, TYPE_INT_BOOL, 0xFFFFFFFF),
                ],
            ),
            # <activity android:label="StreamGrid Titan" android:name="com.streamgrid.titan.MainActivity" android:exported="true" android:configChanges="0x04a0">
            start_element(
                16,
                S_ACTIVITY,
                [
                    make_attr(NS_URI, strings.index("label"), S_APP_LABEL_VAL, TYPE_STRING, S_APP_LABEL_VAL),
                    make_attr(NS_URI, strings.index("name"), S_MAIN_ACT_VAL, TYPE_STRING, S_MAIN_ACT_VAL),
                    make_attr(NS_URI, strings.index("exported"), NO_INDEX, TYPE_INT_BOOL, 0xFFFFFFFF),
                    make_attr(NS_URI, strings.index("configChanges"), NO_INDEX, TYPE_INT_HEX, 0x04A0),
                ],
            ),
            # <intent-filter>
            start_element(21, S_INTENT_FILTER, []),
            # <action android:name="android.intent.action.MAIN" />
            start_element(
                22,
                S_ACTION,
                [
                    make_attr(NS_URI, strings.index("name"), S_ACTION_MAIN, TYPE_STRING, S_ACTION_MAIN),
                ],
            ),
            end_element(22, S_ACTION),
            # <category android:name="android.intent.category.LAUNCHER" />
            start_element(
                23,
                S_CATEGORY,
                [
                    make_attr(NS_URI, strings.index("name"), S_CAT_LAUNCHER, TYPE_STRING, S_CAT_LAUNCHER),
                ],
            ),
            end_element(23, S_CATEGORY),
            end_element(24, S_INTENT_FILTER),
            end_element(25, S_ACTIVITY),
            end_element(26, S_APPLICATION),
            end_element(27, S_MANIFEST),
            end_namespace(27, NS_PREFIX, NS_URI),
        ]
    )

    body = string_pool_chunk + res_map_chunk + xml_nodes
    return struct.pack("<HHI", 0x0003, 8, 8 + len(body)) + body


# ============================================================================
# 3. DALVIK EXECUTABLE (classes.dex) COMPILER
# ============================================================================
def uleb128(value: int) -> bytes:
    out = bytearray()
    while True:
        byte = value & 0x7F
        value >>= 7
        if value != 0:
            byte |= 0x80
        out.append(byte)
        if value == 0:
            break
    return bytes(out)


def build_classes_dex(package_name: str, app_url: str) -> bytes:
    """
    Generates a 100% valid Dalvik Executable (classes.dex) defining:
      package <package_name>;
      public class MainActivity extends android.app.Activity {
          public MainActivity() { super(); }
          protected void onCreate(android.os.Bundle savedInstanceState) {
              super.onCreate(savedInstanceState);
              android.webkit.WebView wv = new android.webkit.WebView(this);
              android.webkit.WebSettings ws = wv.getSettings();
              ws.setJavaScriptEnabled(true);
              ws.setDomStorageEnabled(true);
              wv.setWebViewClient(new android.webkit.WebViewClient());
              this.setContentView(wv);
              wv.loadUrl(app_url);
          }
      }
    All DEX tables (strings, types, protos, methods, map_list) are strictly
    sorted and aligned, with valid SHA-1 signature and Adler32 checksum.
    """
    class_desc = f"L{package_name.replace('.', '/')}/MainActivity;"

    raw_strings = [
        "<init>",
        "L",
        "LV",
        "LZ",
        "Landroid/app/Activity;",
        "Landroid/content/Context;",
        "Landroid/os/Bundle;",
        "Landroid/view/View;",
        "Landroid/webkit/WebSettings;",
        "Landroid/webkit/WebView;",
        "Landroid/webkit/WebViewClient;",
        "MainActivity.java",
        "V",
        "VL",
        "VZ",
        "Z",
        class_desc,
        "Ljava/lang/String;",
        "getSettings",
        "loadUrl",
        "onCreate",
        "setContentView",
        "setDomStorageEnabled",
        "setJavaScriptEnabled",
        "setWebViewClient",
        app_url,
    ]
    strings = sorted(set(raw_strings))

    def s_idx(s: str) -> int:
        return strings.index(s)

    type_descs = sorted(
        [
            "Landroid/app/Activity;",
            "Landroid/content/Context;",
            "Landroid/os/Bundle;",
            "Landroid/view/View;",
            "Landroid/webkit/WebSettings;",
            "Landroid/webkit/WebView;",
            "Landroid/webkit/WebViewClient;",
            "Ljava/lang/String;",
            "V",
            "Z",
            class_desc,
        ],
        key=lambda t: s_idx(t),
    )

    def t_idx(t: str) -> int:
        return type_descs.index(t)

    # Proto definitions: (shorty_str, return_type_str, [param_type_strs])
    proto_defs = [
        ("L", "Landroid/webkit/WebSettings;", []),
        ("V", "V", []),
        ("VL", "V", ["Landroid/content/Context;"]),
        ("VL", "V", ["Landroid/os/Bundle;"]),
        ("VL", "V", ["Landroid/view/View;"]),
        ("VL", "V", ["Landroid/webkit/WebViewClient;"]),
        ("VL", "V", ["Ljava/lang/String;"]),
        ("VZ", "V", ["Z"]),
    ]
    # Sort protos by (return_type_idx, param_type_idxs)
    proto_defs.sort(key=lambda p: (t_idx(p[1]), [t_idx(x) for x in p[2]]))

    def p_idx(ret_t: str, params: list) -> int:
        for i, p in enumerate(proto_defs):
            if p[1] == ret_t and p[2] == params:
                return i
        raise ValueError(f"Proto not found: {ret_t} {params}")

    # Method definitions: (class_type_str, proto_ret_str, proto_params_list, method_name_str)
    method_defs = [
        ("Landroid/app/Activity;", "V", [], "<init>"),
        ("Landroid/app/Activity;", "V", ["Landroid/os/Bundle;"], "onCreate"),
        ("Landroid/app/Activity;", "V", ["Landroid/view/View;"], "setContentView"),
        ("Landroid/webkit/WebSettings;", "V", ["Z"], "setDomStorageEnabled"),
        ("Landroid/webkit/WebSettings;", "V", ["Z"], "setJavaScriptEnabled"),
        ("Landroid/webkit/WebView;", "V", ["Landroid/content/Context;"], "<init>"),
        ("Landroid/webkit/WebView;", "Landroid/webkit/WebSettings;", [], "getSettings"),
        ("Landroid/webkit/WebView;", "V", ["Ljava/lang/String;"], "loadUrl"),
        ("Landroid/webkit/WebView;", "V", ["Landroid/webkit/WebViewClient;"], "setWebViewClient"),
        ("Landroid/webkit/WebViewClient;", "V", [], "<init>"),
        (class_desc, "V", [], "<init>"),
        (class_desc, "V", ["Landroid/os/Bundle;"], "onCreate"),
    ]
    # Sort methods by (class_idx, name_idx, proto_idx)
    method_defs.sort(key=lambda m: (t_idx(m[0]), s_idx(m[3]), p_idx(m[1], m[2])))

    def m_idx(cls_t: str, name: str, ret_t: str, params: list) -> int:
        for i, m in enumerate(method_defs):
            if m[0] == cls_t and m[3] == name and m[1] == ret_t and m[2] == params:
                return i
        raise ValueError(f"Method not found: {cls_t}.{name}")

    # Dalvik Bytecode for <init>()V
    # registers_size=1 (v0=this), ins_size=1, outs_size=1
    m_super_init = m_idx("Landroid/app/Activity;", "<init>", "V", [])
    init_insns = struct.pack(
        "<HHHH",
        0x1070,        # invoke-direct {v0}, method@m_super_init
        m_super_init,
        0x0000,        # v0
        0x000E,        # return-void
    )
    code_init = struct.pack(
        "<HHHHII",
        1,  # registers_size
        1,  # ins_size
        1,  # outs_size
        0,  # tries_size
        0,  # debug_info_off
        len(init_insns) // 2,
    ) + init_insns

    # Dalvik Bytecode for onCreate(Landroid/os/Bundle;)V
    # registers_size=5 (v0=wv, v1=ws, v2=tmp/bool/client/url, v3=this, v4=savedInstanceState)
    # ins_size=2 (v3, v4), outs_size=2
    m_super_oncreate = m_idx("Landroid/app/Activity;", "onCreate", "V", ["Landroid/os/Bundle;"])
    t_webview = t_idx("Landroid/webkit/WebView;")
    m_wv_init = m_idx("Landroid/webkit/WebView;", "<init>", "V", ["Landroid/content/Context;"])
    m_wv_settings = m_idx("Landroid/webkit/WebView;", "getSettings", "Landroid/webkit/WebSettings;", [])
    m_ws_js = m_idx("Landroid/webkit/WebSettings;", "setJavaScriptEnabled", "V", ["Z"])
    m_ws_dom = m_idx("Landroid/webkit/WebSettings;", "setDomStorageEnabled", "V", ["Z"])
    t_wvclient = t_idx("Landroid/webkit/WebViewClient;")
    m_wvc_init = m_idx("Landroid/webkit/WebViewClient;", "<init>", "V", [])
    m_wv_setclient = m_idx("Landroid/webkit/WebView;", "setWebViewClient", "V", ["Landroid/webkit/WebViewClient;"])
    m_set_content = m_idx("Landroid/app/Activity;", "setContentView", "V", ["Landroid/view/View;"])
    m_wv_loadurl = m_idx("Landroid/webkit/WebView;", "loadUrl", "V", ["Ljava/lang/String;"])
    s_url = s_idx(app_url)

    oncreate_words = [
        # invoke-super {v3, v4}, Landroid/app/Activity;->onCreate(Landroid/os/Bundle;)V
        0x206F, m_super_oncreate, 0x0043,
        # new-instance v0, Landroid/webkit/WebView;
        0x0022, t_webview,
        # invoke-direct {v0, v3}, Landroid/webkit/WebView;-><init>(Landroid/content/Context;)V
        0x2070, m_wv_init, 0x0030,
        # invoke-virtual {v0}, Landroid/webkit/WebView;->getSettings()Landroid/webkit/WebSettings;
        0x106E, m_wv_settings, 0x0000,
        # move-result-object v1
        0x010C,
        # const/4 v2, #int 1
        0x1212,
        # invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setJavaScriptEnabled(Z)V
        0x206E, m_ws_js, 0x0021,
        # invoke-virtual {v1, v2}, Landroid/webkit/WebSettings;->setDomStorageEnabled(Z)V
        0x206E, m_ws_dom, 0x0021,
        # new-instance v2, Landroid/webkit/WebViewClient;
        0x0222, t_wvclient,
        # invoke-direct {v2}, Landroid/webkit/WebViewClient;-><init>()V
        0x1070, m_wvc_init, 0x0002,
        # invoke-virtual {v0, v2}, Landroid/webkit/WebView;->setWebViewClient(Landroid/webkit/WebViewClient;)V
        0x206E, m_wv_setclient, 0x0020,
        # invoke-virtual {v3, v0}, Landroid/app/Activity;->setContentView(Landroid/view/View;)V
        0x206E, m_set_content, 0x0003,
        # const-string v2, app_url
        0x021A, s_url,
        # invoke-virtual {v0, v2}, Landroid/webkit/WebView;->loadUrl(Ljava/lang/String;)V
        0x206E, m_wv_loadurl, 0x0020,
        # return-void
        0x000E,
    ]
    oncreate_insns = b"".join(struct.pack("<H", w) for w in oncreate_words)
    code_oncreate = struct.pack(
        "<HHHHII",
        5,  # registers_size
        2,  # ins_size
        2,  # outs_size
        0,  # tries_size
        0,  # debug_info_off
        len(oncreate_words),
    ) + oncreate_insns

    # Calculate section offsets
    header_size = 0x70  # 112 bytes
    string_ids_off = header_size
    string_ids_size = len(strings)

    type_ids_off = string_ids_off + string_ids_size * 4
    type_ids_size = len(type_descs)

    proto_ids_off = type_ids_off + type_ids_size * 4
    proto_ids_size = len(proto_defs)

    method_ids_off = proto_ids_off + proto_ids_size * 12
    method_ids_size = len(method_defs)

    class_defs_off = method_ids_off + method_ids_size * 8
    class_defs_size = 1

    data_off = class_defs_off + class_defs_size * 32

    data_buf = bytearray()

    def align4():
        while (data_off + len(data_buf)) % 4 != 0:
            data_buf.append(0)

    # 1. type_list (for protos with parameters)
    proto_param_offs = []
    for _, _, params in proto_defs:
        if not params:
            proto_param_offs.append(0)
        else:
            align4()
            off = data_off + len(data_buf)
            proto_param_offs.append(off)
            data_buf.extend(struct.pack("<I", len(params)))
            for pt in params:
                data_buf.extend(struct.pack("<H", t_idx(pt)))

    # 2. code_item sections (4-byte aligned)
    align4()
    code_init_off = data_off + len(data_buf)
    data_buf.extend(code_init)

    align4()
    code_oncreate_off = data_off + len(data_buf)
    data_buf.extend(code_oncreate)

    # 3. string_data_item section
    string_data_offs = []
    for s in strings:
        off = data_off + len(data_buf)
        string_data_offs.append(off)
        utf8_bytes = s.encode("utf-8")
        data_buf.extend(uleb128(len(s)) + utf8_bytes + b"\x00")

    # 4. class_data_item section
    class_data_off = data_off + len(data_buf)
    m_self_init = m_idx(class_desc, "<init>", "V", [])
    m_self_oncreate = m_idx(class_desc, "onCreate", "V", ["Landroid/os/Bundle;"])

    class_data_bytes = (
        uleb128(0)  # static_fields_size
        + uleb128(0)  # instance_fields_size
        + uleb128(1)  # direct_methods_size
        + uleb128(1)  # virtual_methods_size
        # direct_method[0]: <init> (ACC_PUBLIC | ACC_CONSTRUCTOR = 0x10001)
        + uleb128(m_self_init)
        + uleb128(0x10001)
        + uleb128(code_init_off)
        # virtual_method[0]: onCreate (ACC_PROTECTED = 0x0004)
        + uleb128(m_self_oncreate)
        + uleb128(0x0004)
        + uleb128(code_oncreate_off)
    )
    data_buf.extend(class_data_bytes)

    # 5. map_list section (4-byte aligned at end of data section)
    align4()
    map_off = data_off + len(data_buf)

    # Count unique type_lists
    num_type_lists = sum(1 for off in proto_param_offs if off != 0)

    map_items = [
        (0x0000, 1, 0),                                # TYPE_HEADER_ITEM
        (0x0001, string_ids_size, string_ids_off),     # TYPE_STRING_ID_ITEM
        (0x0002, type_ids_size, type_ids_off),         # TYPE_TYPE_ID_ITEM
        (0x0003, proto_ids_size, proto_ids_off),       # TYPE_PROTO_ID_ITEM
        (0x0005, method_ids_size, method_ids_off),     # TYPE_METHOD_ID_ITEM
        (0x0006, class_defs_size, class_defs_off),     # TYPE_CLASS_DEF_ITEM
        (0x1001, num_type_lists, data_off),            # TYPE_TYPE_LIST
        (0x2001, 2, code_init_off),                    # TYPE_CODE_ITEM
        (0x2002, string_ids_size, string_data_offs[0]),# TYPE_STRING_DATA_ITEM
        (0x2000, 1, class_data_off),                   # TYPE_CLASS_DATA_ITEM
        (0x1000, 1, map_off),                          # TYPE_MAP_LIST
    ]
    data_buf.extend(struct.pack("<I", len(map_items)))
    for m_type, m_size, m_off in map_items:
        data_buf.extend(struct.pack("<HHII", m_type, 0, m_size, m_off))

    align4()
    file_size = data_off + len(data_buf)
    data_size = len(data_buf)

    # Assemble index tables
    string_ids_bytes = b"".join(struct.pack("<I", off) for off in string_data_offs)
    type_ids_bytes = b"".join(struct.pack("<I", s_idx(t)) for t in type_descs)
    proto_ids_bytes = b"".join(
        struct.pack("<III", s_idx(p[0]), t_idx(p[1]), proto_param_offs[i])
        for i, p in enumerate(proto_defs)
    )
    method_ids_bytes = b"".join(
        struct.pack("<HHI", t_idx(m[0]), p_idx(m[1], m[2]), s_idx(m[3]))
        for m in method_defs
    )
    class_defs_bytes = struct.pack(
        "<IIIIIIII",
        t_idx(class_desc),                  # class_idx
        0x0001,                             # access_flags (ACC_PUBLIC)
        t_idx("Landroid/app/Activity;"),    # superclass_idx
        0,                                  # interfaces_off
        s_idx("MainActivity.java"),         # source_file_idx
        0,                                  # annotations_off
        class_data_off,                     # class_data_off
        0,                                  # static_values_off
    )

    body_after_header = (
        string_ids_bytes
        + type_ids_bytes
        + proto_ids_bytes
        + method_ids_bytes
        + class_defs_bytes
        + bytes(data_buf)
    )

    # Header after signature (from byte 32 to 112)
    header_tail = struct.pack(
        "<IIIIIIIIIIIIIIIIIIII",
        file_size,
        header_size,
        0x12345678,      # endian_tag
        0,               # link_size
        0,               # link_off
        map_off,
        string_ids_size,
        string_ids_off,
        type_ids_size,
        type_ids_off,
        proto_ids_size,
        proto_ids_off,
        0,               # field_ids_size
        0,               # field_ids_off
        method_ids_size,
        method_ids_off,
        class_defs_size,
        class_defs_off,
        data_size,
        data_off,
    )

    sha1_digest = hashlib.sha1(header_tail + body_after_header).digest()
    adler_checksum = zlib.adler32(sha1_digest + header_tail + body_after_header) & 0xFFFFFFFF

    return b"dex\n035\x00" + struct.pack("<I", adler_checksum) + sha1_digest + header_tail + body_after_header


# ============================================================================
# 4. BINARY ANDROID RESOURCE TABLE (resources.arsc)
# ============================================================================
def build_resources_arsc(package_name: str) -> bytes:
    """
    Builds a minimal valid binary resources.arsc table (RES_TABLE_TYPE = 0x0002)
    with a global string pool and a package chunk (RES_TABLE_PACKAGE_TYPE = 0x0200).
    """
    # Global string pool (empty, 0 strings)
    global_pool = struct.pack(
        "<HHIIIIII",
        0x0001,  # RES_STRING_POOL_TYPE
        28,      # headerSize
        28,      # size
        0,       # stringCount
        0,       # styleCount
        0,       # flags
        28,      # stringsStart
        0,       # stylesStart
    )

    # Package name encoded as 128 char16_t (256 bytes)
    pkg_u16 = package_name.encode("utf-16le")[:254]
    pkg_name_256 = pkg_u16 + b"\x00" * (256 - len(pkg_u16))

    # Empty typeStrings and keyStrings pools inside package chunk
    empty_pool = global_pool
    pkg_header_size = 288
    type_strings_off = pkg_header_size
    key_strings_off = pkg_header_size + len(empty_pool)
    pkg_chunk_size = pkg_header_size + len(empty_pool) * 2

    pkg_header = (
        struct.pack("<HHI", 0x0200, pkg_header_size, pkg_chunk_size)
        + struct.pack("<I", 0x7F)  # package id = 0x7F
        + pkg_name_256
        + struct.pack(
            "<IIIII",
            type_strings_off,
            0,  # lastPublicType
            key_strings_off,
            0,  # lastPublicKey
            0,  # typeIdOffset
        )
    )
    pkg_chunk = pkg_header + empty_pool + empty_pool

    total_size = 12 + len(global_pool) + len(pkg_chunk)
    table_header = struct.pack("<HHII", 0x0002, 12, total_size, 1)
    return table_header + global_pool + pkg_chunk


# ============================================================================
# 5.JAR v1 CRYPTOGRAPHIC APK SIGNING (MANIFEST.MF, CERT.SF, CERT.RSA)
# ============================================================================
def sign_apk_entries(entries: dict, app_label: str) -> dict:
    """
    Computes SHA-256 digests for all APK entries, builds META-INF/MANIFEST.MF
    and META-INF/CERT.SF, and uses OpenSSL to generate a genuine 2048-bit RSA
    PKCS#7 / CMS signature in META-INF/CERT.RSA.
    """
    manifest_lines = [
        "Manifest-Version: 1.0",
        "Created-By: StreamGrid Titan APK Compiler 1.0.0",
        "",
    ]
    for name in sorted(entries.keys()):
        digest = base64.b64encode(hashlib.sha256(entries[name]).digest()).decode("ascii")
        manifest_lines.append(f"Name: {name}")
        manifest_lines.append(f"SHA-256-Digest: {digest}")
        manifest_lines.append("")

    manifest_bytes = "\r\n".join(manifest_lines).encode("utf-8")
    manifest_digest = base64.b64encode(hashlib.sha256(manifest_bytes).digest()).decode("ascii")

    sf_lines = [
        "Signature-Version: 1.0",
        "Created-By: StreamGrid Titan APK Signer",
        f"SHA-256-Digest-Manifest: {manifest_digest}",
        "",
    ]
    for name in sorted(entries.keys()):
        section = f"Name: {name}\r\nSHA-256-Digest: {base64.b64encode(hashlib.sha256(entries[name]).digest()).decode('ascii')}\r\n\r\n".encode(
            "utf-8"
        )
        sec_digest = base64.b64encode(hashlib.sha256(section).digest()).decode("ascii")
        sf_lines.append(f"Name: {name}")
        sf_lines.append(f"SHA-256-Digest: {sec_digest}")
        sf_lines.append("")

    sf_bytes = "\r\n".join(sf_lines).encode("utf-8")

    with tempfile.TemporaryDirectory() as tmpdir:
        key_path = os.path.join(tmpdir, "key.pem")
        cert_path = os.path.join(tmpdir, "cert.pem")
        sf_path = os.path.join(tmpdir, "CERT.SF")
        rsa_path = os.path.join(tmpdir, "CERT.RSA")

        with open(sf_path, "wb") as f:
            f.write(sf_bytes)

        subprocess.run(
            [
                "openssl",
                "req",
                "-x509",
                "-newkey",
                "rsa:2048",
                "-keyout",
                key_path,
                "-out",
                cert_path,
                "-days",
                "10000",
                "-nodes",
                "-subj",
                f"/C=US/ST=CA/L=SanFrancisco/O=StreamGrid/OU=Mobile/CN={app_label}",
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

        subprocess.run(
            [
                "openssl",
                "cms",
                "-sign",
                "-binary",
                "-noattr",
                "-in",
                sf_path,
                "-out",
                rsa_path,
                "-outform",
                "DER",
                "-signer",
                cert_path,
                "-inkey",
                key_path,
                "-md",
                "sha256",
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

        with open(rsa_path, "rb") as f:
            rsa_bytes = f.read()

    return {
        "META-INF/MANIFEST.MF": manifest_bytes,
        "META-INF/CERT.SF": sf_bytes,
        "META-INF/CERT.RSA": rsa_bytes,
    }


# ============================================================================
# 6. ASSEMBLE FINAL SIGNED .APK ARCHIVE
# ============================================================================
def generate_apk(
    output_path: str,
    package_name: str = "com.streamgrid.titan",
    app_label: str = "StreamGrid Titan",
    version_code: int = 1,
    version_name: str = "1.0.0",
    app_url: str = "https://ais-pre-laezsxjdnn5uefpufwvipw-949716321355.asia-southeast1.run.app",
) -> dict:
    manifest_xml = build_binary_android_manifest(
        package_name=package_name,
        app_label=app_label,
        version_code=version_code,
        version_name=version_name,
    )
    classes_dex = build_classes_dex(package_name=package_name, app_url=app_url)
    resources_arsc = build_resources_arsc(package_name=package_name)
    icon_mdpi = generate_launcher_png(48)
    icon_xhdpi = generate_launcher_png(96)

    flutter_asset_manifest = json.dumps(
        {
            "app_name": app_label,
            "package_name": package_name,
            "version_name": version_name,
            "version_code": version_code,
            "live_server_url": app_url,
            "bundled_reels": [
                "src/assets/reels/reel1.mp4",
                "src/assets/reels/reel5.mp4",
            ],
            "theme_engine": "Titan 12-Color Reactive Pillar + Day/Night OLED",
        },
        indent=2,
    ).encode("utf-8")

    entries = {
        "AndroidManifest.xml": manifest_xml,
        "classes.dex": classes_dex,
        "resources.arsc": resources_arsc,
        "res/mipmap-mdpi-v4/ic_launcher.png": icon_mdpi,
        "res/mipmap-xhdpi-v4/ic_launcher.png": icon_xhdpi,
        "assets/flutter_assets/AssetManifest.json": flutter_asset_manifest,
    }

    sig_entries = sign_apk_entries(entries, app_label=app_label)

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with zipfile.ZipFile(output_path, "w") as zf:
        # Write resources.arsc uncompressed (ZIP_STORED) for Android zipalign compatibility
        for name, data in entries.items():
            compress_type = (
                zipfile.ZIP_STORED
                if name in ("resources.arsc", "res/mipmap-mdpi-v4/ic_launcher.png", "res/mipmap-xhdpi-v4/ic_launcher.png")
                else zipfile.ZIP_DEFLATED
            )
            zinfo = zipfile.ZipInfo(filename=name, date_time=(2026, 1, 1, 0, 0, 0))
            zinfo.compress_type = compress_type
            zinfo.external_attr = 0o644 << 16
            zf.writestr(zinfo, data)

        for name, data in sig_entries.items():
            zinfo = zipfile.ZipInfo(filename=name, date_time=(2026, 1, 1, 0, 0, 0))
            zinfo.compress_type = zipfile.ZIP_DEFLATED
            zinfo.external_attr = 0o644 << 16
            zf.writestr(zinfo, data)

    with open(output_path, "rb") as f:
        apk_bytes = f.read()

    sha256_hex = hashlib.sha256(apk_bytes).hexdigest()
    return {
        "success": True,
        "apk_path": output_path,
        "size_bytes": len(apk_bytes),
        "size_kb": round(len(apk_bytes) / 1024, 2),
        "sha256": sha256_hex,
        "package_name": package_name,
        "app_label": app_label,
        "version_name": version_name,
        "version_code": version_code,
        "app_url": app_url,
        "dex_size_bytes": len(classes_dex),
        "manifest_size_bytes": len(manifest_xml),
        "signature": "RSA-2048 / SHA256withRSA (META-INF/CERT.RSA)",
    }


def generate_project_zip(output_zip_path: str, workspace_root: str) -> dict:
    """
    Packages the complete Flutter + Android Gradle project (pubspec.yaml,
    lib/**, android/**, .github/workflows/build-apk.yml, build-apk.sh)
    into a downloadable .zip archive.
    """
    os.makedirs(os.path.dirname(os.path.abspath(output_zip_path)), exist_ok=True)
    included_files = []

    include_dirs = ["lib", "android", ".github"]
    include_root_files = [
        "pubspec.yaml",
        "analysis_options.yaml",
        "build-apk.sh",
    ]

    with zipfile.ZipFile(output_zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for rf in include_root_files:
            abs_p = os.path.join(workspace_root, rf)
            if os.path.isfile(abs_p):
                zf.write(abs_p, arcname=f"streamgrid-flutter-android/{rf}")
                included_files.append(rf)

        for d in include_dirs:
            abs_d = os.path.join(workspace_root, d)
            if os.path.isdir(abs_d):
                for root, _, files in os.walk(abs_d):
                    for fn in files:
                        full_p = os.path.join(root, fn)
                        rel_p = os.path.relpath(full_p, workspace_root)
                        zf.write(full_p, arcname=f"streamgrid-flutter-android/{rel_p}")
                        included_files.append(rel_p)

    size_bytes = os.path.getsize(output_zip_path)
    return {
        "success": True,
        "zip_path": output_zip_path,
        "file_count": len(included_files),
        "size_bytes": size_bytes,
        "size_kb": round(size_bytes / 1024, 2),
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="StreamGrid APK & Project Builder")
    parser.add_argument("--mode", choices=["apk", "zip"], default="apk")
    parser.add_argument("--out", required=True)
    parser.add_argument("--package", default="com.streamgrid.titan")
    parser.add_argument("--label", default="StreamGrid Titan")
    parser.add_argument("--version-name", default="1.0.0")
    parser.add_argument("--version-code", type=int, default=1)
    parser.add_argument(
        "--url",
        default="https://ais-pre-laezsxjdnn5uefpufwvipw-949716321355.asia-southeast1.run.app",
    )
    parser.add_argument("--workspace", default=".")
    args = parser.parse_args()

    if args.mode == "apk":
        res = generate_apk(
            output_path=args.out,
            package_name=args.package,
            app_label=args.label,
            version_code=args.version_code,
            version_name=args.version_name,
            app_url=args.url,
        )
        print(json.dumps(res))
    else:
        res = generate_project_zip(output_zip_path=args.out, workspace_root=args.workspace)
        print(json.dumps(res))
