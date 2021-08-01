## Instructions to build a `v fmt` wasm binary

note: you will need [emscripten](https://emscripten.org/docs/getting_started/downloads.html)!

 1. Compile `vfmt` to a C file: run `v -os linux -o vfmt.c cmd/tools/vfmt.v` from your V install root
 1. copy the generated `vfmt.c` to this directory
 1. use `emscripten` to compile `vfmt.c` to WebAssembly:
    ```sh
    emcc -D__linux__ -s ENVIRONMENT=web \
        -s EXPORTED_RUNTIME_METHODS=["callMain"] -s INVOKE_RUN=0 \
        -s ALLOW_MEMORY_GROWTH=1 --no-heap-copy \
        -Oz -flto -w \
        --post-js vfmt.js \
        -o ../vfmt.js placeholders.c vfmt.c
    ```
