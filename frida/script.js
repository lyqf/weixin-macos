const targetModule = Process.findModuleByName("WeChat"); // 仅关注主二进制文件

const targetPtr = ptr("0x600000EF1648");  // 你想监控的地址

MemoryAccessMonitor.enable(
    {
        base: targetPtr,
        size: 0x40
    },
    {
        onAccess(details) {
            console.log("==== Memory Access ====");
            console.log("Operation:", details.operation); // read / write / exec
            console.log("From:", details.from.sub(targetModule.from).add(0x100000000).toString());
            console.log("Address:", details.address);
            console.log("=== Backtrace ===");
            console.log(
                Thread.backtrace(details.context, Backtracer.ACCURATE)
                    .map(DebugSymbol.fromAddress)
                    .join("\n")
            );
        }
    });
