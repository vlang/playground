FROM thevlang/vlang:buster-dev

# options
ARG DEV_IMG="false"

# disable tzdata questions
ENV DEBIAN_FRONTEND=noninteractive

# use bash
SHELL ["/bin/bash", "-c"]

# install apt-utils
RUN apt-get update -y \
  && apt-get install -y apt-utils 2> >( grep -v 'debconf: delaying package configuration, since apt-utils is not installed' >&2 ) \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# essential tools
RUN apt-get update -y && apt-get install -y --no-install-recommends \
    ca-certificates \
    netbase \
    curl \
    git \
    make \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# install isolate
RUN apt-get update -y && apt-get install -y --no-install-recommends \
    libcap-dev \
    libseccomp-dev \
    libseccomp2 \
    libcap2-bin \
    asciidoc \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/ioi/isolate /tmp/isolate \
  && cd /tmp/isolate \
  && make isolate isolate-check-environment \
  && make install \
  && rm -rf /tmp/isolate
