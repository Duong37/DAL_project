#!/usr/bin/env python3
"""Setup for dal_jupyterlab_extension."""

import os
import subprocess
import sys
from pathlib import Path

from setuptools import setup, find_packages
from setuptools.command.build_py import build_py
from setuptools.command.develop import develop

HERE = Path(__file__).parent.resolve()

# Name of the project
name = "dal_jupyterlab_extension"

# Get the package info
package_json_path = HERE / "package.json"
labext_name = "jupyterlab-dal-extension"

# Representative files that should exist after a successful build
lab_path = HERE / name / "labextension"

def build_labextension():
    """Build the labextension."""
    build_cmd = ["jlpm", "run", "build:prod"]
    subprocess.check_call(build_cmd, cwd=HERE)

class BuildPyCommand(build_py):
    """Custom build command."""
    def run(self):
        build_labextension()
        super().run()

class DevelopCommand(develop):
    """Custom develop command."""
    def run(self):
        build_labextension()
        super().run()

# Get version from package.json
import json
with open(package_json_path) as f:
    package_json = json.load(f)
version = package_json["version"]

# Build data_files list properly
data_files = []
if lab_path.exists():
    # Add the install.json and package.json files
    data_files.extend([
        (f"share/jupyter/labextensions/{labext_name}", [str(HERE / "install.json")]),
        (f"share/jupyter/labextensions/{labext_name}", [str(lab_path / "package.json")]),
    ])
    
    # Add all files in the labextension directory
    for path in lab_path.rglob("*"):
        if path.is_file() and path.name != "package.json":  # package.json already added above
            relative_path = path.relative_to(lab_path)
            target_dir = f"share/jupyter/labextensions/{labext_name}"
            if relative_path.parent != Path("."):
                target_dir = f"share/jupyter/labextensions/{labext_name}/{relative_path.parent}"
            data_files.append((target_dir, [str(path)]))

setup(
    name=name,
    version=version,
    description="A JupyterLab extension for Decentralized Active Learning",
    long_description=(HERE / "README.md").read_text(encoding="utf-8"),
    long_description_content_type="text/markdown",
    packages=find_packages(),
    zip_safe=False,
    include_package_data=True,
    python_requires=">=3.7",
    install_requires=[
        "jupyterlab>=3.0.0,<4",
    ],
    cmdclass={
        "build_py": BuildPyCommand,
        "develop": DevelopCommand,
    },
    data_files=data_files,
    author="DAL Project Team",
    author_email="dal@example.com",
    url="https://github.com/yourusername/DAL_project",
    license="MIT",
    platforms="Linux, Mac OS X, Windows",
    keywords=["Jupyter", "JupyterLab", "JupyterLab3"],
    classifiers=[
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Framework :: Jupyter",
        "Framework :: Jupyter :: JupyterLab",
        "Framework :: Jupyter :: JupyterLab :: 3",
        "Framework :: Jupyter :: JupyterLab :: Extensions",
        "Framework :: Jupyter :: JupyterLab :: Extensions :: Prebuilt",
    ],
) 