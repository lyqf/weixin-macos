function dumpMemoryToHex(ptr, size) {
    try {
        // 1. 读取内存数据
        const buffer = ptr.readByteArray(size);
        const data = new Uint8Array(buffer);

        let output = "";
        let line = "";

        for (let i = 0; i < data.length; i++) {
            // 格式化为 0x00 形式
            const hex = "0x" + data[i].toString(16).padStart(2, '0').toUpperCase();
            line += hex;

            // 如果不是最后一个元素，添加逗号和空格
            if (i < data.length - 1) {
                line += ", ";
            }

            // 每 8 个字节输出一行
            if ((i + 1) % 8 === 0 || i === data.length - 1) {
                output += line + "\n";
                line = "";
            }
        }

        console.log("==================== MEMORY DUMP ====================");
        console.log(output);
        console.log("=====================================================");

    } catch (e) {
        console.log("[-] Dump 失败: " + e.message);
    }
}



function generateRandom5ByteVarint() {
    let res = [];

    // 前 4 个字节：最高位(bit 7)必须是 1，低 7 位随机
    for (let i = 0; i < 4; i++) {
        let random7Bit = Math.floor(Math.random() * 128);
        res.push(random7Bit | 0x80); // 强制设置最高位为 1
    }

    // 第 5 个字节：最高位必须是 0，为了确保不变成 4 字节，低 7 位不能全为 0
    let lastByte = Math.floor(Math.random() * 127) + 1;
    res.push(lastByte & 0x7F); // 确保最高位为 0

    return res;
}

// 辅助函数：Protobuf Varint 编码 (对应 get_varint_timestamp_bytes)
function getVarintTimestampBytes() {
    let ts = Math.floor(Date.now() / 1000);
    let encodedBytes = [];
    let tempTs = ts >>> 0; // 强制转为 32位 无符号整数

    while (true) {
        let byte = tempTs & 0x7F;
        tempTs >>>= 7;
        if (tempTs !== 0) {
            encodedBytes.push(byte | 0x80);
        } else {
            encodedBytes.push(byte);
            break;
        }
    }
    return encodedBytes;
}