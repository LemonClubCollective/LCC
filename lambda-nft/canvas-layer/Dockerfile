FROM public.ecr.aws/lambda/nodejs:18
WORKDIR ${LAMBDA_TASK_ROOT}
RUN yum update -y && yum install -y \
    tar gzip libpng-devel libjpeg-turbo-devel libuuid-devel curl gcc gcc-c++ make python3 \
    pixman pixman-devel cairo cairo-devel freetype freetype-devel fontconfig fontconfig-devel libX11 libX11-devel libXext libXext-devel pkgconfig \
    pango pango-devel glib2 glib2-devel harfbuzz harfbuzz-devel libpng libjpeg-turbo mesa-libEGL mesa-libGL mesa-libgbm libdrm libuuid expat libXrender libxcb libXau libXdmcp zlib \
    libthai libffi fribidi graphite2 libdatrie pcre pcre2 libselinux libXxf86vm && \
    curl -L -o zlib-1.2.13.tar.gz https://zlib.net/fossils/zlib-1.2.13.tar.gz && \
    tar -xzf zlib-1.2.13.tar.gz && cd zlib-1.2.13 && \
    ./configure --prefix=/usr/local && make && make install && \
    cd .. && rm -rf zlib-1.2.13 zlib-1.2.13.tar.gz
ENV PKG_CONFIG_PATH=/usr/lib64/pkgconfig:/usr/local/lib/pkgconfig:/usr/lib/pkgconfig:/usr/share/pkgconfig
RUN npm install --build-from-source canvas@2.11.2
RUN mkdir -p /var/task/layer/nodejs/node_modules/canvas && \
    cp -r node_modules/canvas/* /var/task/layer/nodejs/node_modules/canvas/ && \
    ls -l /var/task/layer/nodejs/node_modules/canvas
RUN cp /usr/lib64/libpixman-1.so.0 /var/task/layer/nodejs/node_modules/canvas/build/Release/ && \
    cp /usr/lib64/libcairo.so.2 /var/task/layer/nodejs/node_modules/canvas/build/Release/ && \
    cp /usr/lib64/libpango-1.0.so.0 /var/task/layer/nodejs/node_modules/canvas/build/Release/ && \
    cp /usr/lib64/libpangocairo-1.0.so.0 /var/task/layer/nodejs/node_modules/canvas/build/Release/ && \
    cp /usr/lib64/libpangoft2-1.0.so.0 /var/task/layer/nodejs/node_modules/canvas/build/Release/ && \
    cp /usr/lib64/libfreetype.so.6 /var/task/layer/nodejs/node_modules/canvas/build/Release/ && \
    cp /usr/lib64/libfontconfig.so.1 /var/task/layer/nodejs/node_modules/canvas/build/Release/ && \
    cp /usr/lib64/libX11.so.6 /var/task/layer/nodejs/node_modules/canvas/build/Release/ && \
    cp /usr/lib64/libXext.so.6 /var/task/layer/nodejs/node_modules/canvas/build/Release/ && \
    cp /usr/lib64/libglib-2.0.so.0 /var/task/layer/nodejs/node_modules/canvas/build/Release/ && \
    cp /usr/lib64/libgobject-2.0.so.0 /var/task/layer/nodejs/node_modules/canvas/build/Release/ && \
    cp /usr/lib64/libharfbuzz.so.0 /var/task/layer/nodejs/node_modules/canvas/build/Release/ && \
    cp /usr/lib64/libpng15.so.15 /var/task/layer/nodejs/node_modules/canvas/build/Release/ && \
    cp /usr/lib64/libjpeg.so.62 /var/task/layer/nodejs/node_modules/canvas/build/Release/ && \
    cp /usr/lib64/libEGL.so.1 /var/task/layer/nodejs/node_modules/canvas/build/Release/ && \
    cp /usr/lib64/libuuid.so.1 /var/task/layer/nodejs/node_modules/canvas/build/Release/ && \
    cp /usr/lib64/libexpat.so.1 /var/task/layer/nodejs/node_modules/canvas/build/Release/ && \
    cp /usr/lib64/libXrender.so.1 /var/task/layer/nodejs/node_modules/canvas/build/Release/ && \
    cp /usr/lib64/libxcb.so.1 /var/task/layer/nodejs/node_modules/canvas/build/Release/ && \
    cp /usr/lib64/libxcb-shm.so.0 /var/task/layer/nodejs/node_modules/canvas/build/Release/ && \
    cp /usr/lib64/libxcb-render.so.0 /var/task/layer/nodejs/node_modules/canvas/build/Release/ && \
    cp /usr/lib64/libX11-xcb.so.1 /var/task/layer/nodejs/node_modules/canvas/build/Release/ && \
    cp /usr/lib64/libXau.so.6 /var/task/layer/nodejs/node_modules/canvas/build/Release/ && \
    cp /usr/lib64/libXdmcp.so.6 /var/task/layer/nodejs/node_modules/canvas/build/Release/ && \
    cp /usr/lib64/libz.so.1 /var/task/layer/nodejs/node_modules/canvas/build/Release/ && \
    cp /usr/lib64/libGL.so.1 /var/task/layer/nodejs/node_modules/canvas/build/Release/ || echo "libGL.so.1 not found" && \
    cp /usr/lib64/libGLdispatch.so.0 /var/task/layer/nodejs/node_modules/canvas/build/Release/ || echo "libGLdispatch.so.0 not found" && \
    cp /usr/lib64/libdrm.so.2 /var/task/layer/nodejs/node_modules/canvas/build/Release/ || echo "libdrm.so.2 not found" && \
    cp /usr/lib64/libglapi.so.0 /var/task/layer/nodejs/node_modules/canvas/build/Release/ || echo "libglapi.so.0 not found" && \
    cp /usr/lib64/libthai.so.0 /var/task/layer/nodejs/node_modules/canvas/build/Release/ || echo "libthai.so.0 not found" && \
    cp /usr/lib64/libffi.so.6 /var/task/layer/nodejs/node_modules/canvas/build/Release/ || echo "libffi.so.6 not found" && \
    cp /usr/lib64/libfribidi.so.0 /var/task/layer/nodejs/node_modules/canvas/build/Release/ || echo "libfribidi.so.0 not found" && \
    cp /usr/lib64/libgraphite2.so.3 /var/task/layer/nodejs/node_modules/canvas/build/Release/ || echo "libgraphite2.so.3 not found" && \
    cp /usr/lib64/libdatrie.so.1 /var/task/layer/nodejs/node_modules/canvas/build/Release/ || echo "libdatrie.so.1 not found" && \
    cp /usr/lib64/libpcre.so.1 /var/task/layer/nodejs/node_modules/canvas/build/Release/ || echo "libpcre.so.1 not found" && \
    cp /usr/lib64/libpcre2-8.so.0 /var/task/layer/nodejs/node_modules/canvas/build/Release/ || echo "libpcre2-8.so.0 not found" && \
    cp /usr/lib64/libselinux.so.1 /var/task/layer/nodejs/node_modules/canvas/build/Release/ || echo "libselinux.so.1 not found" && \
    cp /usr/lib64/libGLX.so.0 /var/task/layer/nodejs/node_modules/canvas/build/Release/ || echo "libGLX.so.0 not found" && \
    cp /usr/lib64/libXxf86vm.so.1 /var/task/layer/nodejs/node_modules/canvas/build/Release/ || echo "libXxf86vm.so.1 not found" && \
    cp /usr/lib64/libgbm.so.1 /var/task/layer/nodejs/node_modules/canvas/build/Release/ || echo "libgbm.so.1 not found" && \
    ls -l /var/task/layer/nodejs/node_modules/canvas/build/Release && \
    ldd /var/task/layer/nodejs/node_modules/canvas/build/Release/canvas.node || echo "ldd failed" && \
    for lib in /var/task/layer/nodejs/node_modules/canvas/build/Release/*.so; do echo "Dependencies for $lib:"; ldd $lib || echo "ldd failed for $lib"; done
CMD ["echo", "Build complete"]