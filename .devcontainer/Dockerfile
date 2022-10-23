FROM thevlang/vlang:buster-dev

# options
ARG DEV_IMG="false"

# disable tzdata questions
ENV DEBIAN_FRONTEND=noninteractive

# use bash
SHELL ["/bin/bash", "-c"]

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

##################################################################################################
#                                                                                                #
#   The code below is copied from:                                                               #
#      https://github.com/microsoft/vscode-remote-try-go/blob/master/.devcontainer/Dockerfile    #
#   And modifies to use v lang instead                                                           #
#                                                                                                #
##################################################################################################

# Options for setup script
ARG INSTALL_ZSH="true"
ARG UPGRADE_PACKAGES="false"
ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# Install needed packages and setup non-root user. Use a separate RUN statement to add your own dependencies.
COPY .devcontainer/common-debian.sh /tmp/library-scripts/
RUN apt-get update \
  && /bin/bash /tmp/library-scripts/common-debian.sh "${INSTALL_ZSH}" "${USERNAME}" "${USER_UID}" "${USER_GID}" "${UPGRADE_PACKAGES}" \
  && apt-get autoremove -y && apt-get clean -y && rm -rf /var/lib/apt/lists/* /tmp/library-scripts
