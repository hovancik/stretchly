FROM snapcore/snapcraft:latest
RUN mkdir /stretchly
WORKDIR /stretchly
ADD . /stretchly
