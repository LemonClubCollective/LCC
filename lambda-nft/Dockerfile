FROM public.ecr.aws/lambda/nodejs:18
WORKDIR ${LAMBDA_TASK_ROOT}
RUN yum update -y && yum install -y tar gzip libpng-devel libjpeg-devel libuuid-devel curl gcc make && \
    curl -L -o zlib-1.2.13.tar.gz https://zlib.net/fossils/zlib-1.2.13.tar.gz && \
    tar -xzf zlib-1.2.13.tar.gz && cd zlib-1.2.13 && \
    ./configure --prefix=/usr/local && make && make install && \
    cd .. && rm -rf zlib-1.2.13 zlib-1.2.13.tar.gz
COPY package.json .
RUN npm install --production axios @aws-sdk/client-s3 && \
    LDFLAGS="-L/usr/local/lib" CFLAGS="-I/usr/local/include" npm install --build-from-source canvas@2.11.2
RUN mkdir -p /var/task/lib && \
    ls -l /usr/local/lib && \
    cp /usr/local/lib/libz.so.1.2.13 /var/task/lib/ && \
    ln -s libz.so.1.2.13 /var/task/lib/libz.so.1 && \
    ls -l /var/task/lib
COPY index.js .
# Use the Lambda RIC entrypoint
ENTRYPOINT ["/lambda-entrypoint.sh"]
CMD ["index.handler"]