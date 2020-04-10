# Template WebGL project for Mac
## Description
Inspired by [this fantastic tutorial](https://www.youtube.com/watch?v=kB0ZVUrI4Aw&list=PLjcVFFANLS5zH_PeKC6I8p0Pt1hzph_rt), I am creating a template for 3D WebGL projects from scratch and avoiding as much as possible the use of external libraries.

There are two shaders:
- 2D, for sprites (a textured quad), which are always located in front of everything else
- 3D, for all three-dimensional objects.
The 3D shader is modified at run time, depending on the presence of lights in the scene or if the texture is enabled

Meshes are loaded from the ```assets``` folder.

Unit tests are also included.

An installer file for MacOS is also provided to setup the environment in one click (actually, a double click).

## Instructions
### Setup the project
- Clone repository
- run ```./install-mac```
### Run the WebGL application
- run ```./bin/run-all```
### Uninstall:
- run ```./bin/uninstall-mac```
