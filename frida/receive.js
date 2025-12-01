const mod = Process.getModuleByName("WeChat");
console.log("[+] Base Address:", mod.base);
var counterMap = new Map();

function checkValid(p) {
    if (p.isNull()) {
        return false;
    }

    if (!p.and(0x7).isNull()) {
        return false;
    }
    if (p.compare(ptr("0x600000000000")) >= 0 && p.compare(ptr("0x700000000000")) < 0) {
        return true;
    }
    return false;
}

function handlePr(addr, keyword) {
    const realAddr = ptr("0x" + addr).sub("0x100000000").add(mod.base);
    console.log("[+] real Address:", realAddr)

    Interceptor.attach(realAddr, {
        onEnter(args) {
            const currentCount = counterMap.get(addr) || 0;
            counterMap.set(addr, currentCount + 1);
            console.log(`${addr} called ${currentCount} times`);

            try {
                if (this.context.x0.compare(ptr("0x100000000")) >= 0) {
                    console.log(`[!] X3 Register Value: ${this.context.x3}`);
                    dump(this.context.x0)
                }

                if (this.context.x20.compare(ptr("0x100000000")) >= 0) {
                    console.log(`[!] X20 Register Value: ${this.context.x20}`);
                    dump(this.context.x20)
                }
            } catch (e) {
                console.log("Enter Error:", e);
            }
        },

        onLeave(retval) {
        }
    });

}


const prs = ["102B66C30"]
const k = "";
for (let pr of prs) {
    handlePr(pr, k);
}

function ShowCount() {
    for (let [addr, count] of counterMap) {
        console.log(`${addr}: ${count}`);
    }
}

function clearCount() {
    counterMap.clear();
    console.log("Counter cleared.");
}


function dump(xValue) {
    console.log(`X has a pointer: ${xValue}`);

    let buf = null;

    try {
        const buf = xValue.readByteArray(512)
        let s = "";
        const u8 = new Uint8Array(buf);
        for (let b of u8) {
            if (b >= 0x20 && b <= 0x7E) {
                s += String.fromCharCode(b);
            } else {
                s += ".";
            }
        }

        console.log(s);

    } catch (e) {
        console.warn(`[!] 首次读取失败，尝试修改权限... 错误: ${e.message}`);

    }

    // --- 内存读取成功，进行解码 ---
    if (buf) {
        let s = "";
        const u8 = new Uint8Array(buf);
        // ... (您的解码逻辑)
        for (let b of u8) {
            if (b >= 0x20 && b <= 0x7E) {
                s += String.fromCharCode(b);
            } else {
                s += ".";
            }
        }
        console.log(`||  Read String: ${s} \n||  Raw Data: ${u8}`);
    }
}