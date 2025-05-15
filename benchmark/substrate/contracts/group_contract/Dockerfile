FROM rust:1.79-slim

# Install system dependencies (C++ compiler, pkg-config, etc.)
RUN apt-get update && apt-get install -y \
    build-essential \
    pkg-config \
    libssl-dev \
    curl \
    git \
    clang \
    lld \
    cmake

# Install Rust toolchain components
RUN rustup update nightly && \
    rustup target add wasm32-unknown-unknown --toolchain nightly && \
    rustup component add rust-src --toolchain nightly && \
    cargo install cargo-contract --version 3.2.0 --locked

# Set working directory
WORKDIR /code
COPY . .

CMD ["bash"]
