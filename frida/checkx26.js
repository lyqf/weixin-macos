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

            try {
                const x26Value = this.context.x26;
                console.log(`[!] X26 Register Value: ${x26Value}`);


                if (checkValid(x26Value)) {
                    console.log(`\n[+] ${addr} || X26 has a valid pointer: ${x26Value}`);

                    const buf = x26Value.readByteArray(128);
                    if (buf) {
                        let s = "";
                        const u8 = new Uint8Array(buf);
                        for (let b of u8) {
                            if (b >= 0x20 && b <= 0x7E) {
                                s += String.fromCharCode(b);
                            } else {
                                s += ".";
                            }
                        }

                        if (s.includes(keyword) || keyword === "") {
                            console.log(addr + "|| X26 Read String: " + s + `${u8}`);
                            // 打印堆栈追踪
                            console.log(Thread.backtrace(this.context, Backtracer.ACCURATE)
                                .map(DebugSymbol.fromAddress).join('\n'));
                        }
                    }
                }
            } catch (e) {
                console.log("Enter Error:", e);
            }


        },

        onLeave(retval) {
        }
    });

}


const prs = ["102454D74"]
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
