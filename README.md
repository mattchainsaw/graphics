# Port Hole

Available [here][1].  
Final Project for CSCI 3820 - Computer Graphics  
Matthew Meyer  
Saint Louis University

## Table of Contents
**[Overview](#overview)**  
**[Controls](#controls)**  
**[Requirements](#requirements)**   
**[Design](#design)**  

## Overview
Port Hole is an open source, in browser game that was inspired by the game [Portal][2] 
by [Valve][3]. This is in no way is a copy of the game, but the mechanics are similar. 
The game will be a first person shooter where the player may place two different port 
holes on the level map. If the player has both port holes on the map, the player may go 
through them to get to different areas of the map. The game will be in a puzzle platform 
style, where the player must get through one level at a time.


## Controls
The player will be able to move around with the **A S D W** keys and jump with the space 
bar. To shoot port holes, the player may right click or left click depending on which port 
hole he or she wants to place. The player will always aim at the center of the screen, and 
can move the camera around with their cursor. 

For a better playing experience, a mouse is recommended.


## Requirements
 - The game will be created using the [three.js][4] library  
 - The game will feature player controls to move around the level and shoot port holes  
 - The player will be able to go into one port hole and come out the other  
 - The player will be able to view the scene through the port holes  
 - The project will come with one level

*Additional Requirements:*  
 - Ability to pick up and place objects  
 - More levels  
 - Ability to move objects through port holes  

## Design

#### Player and Physics
The player will be implemented as its own class. It is based off of the 
THREE.PointerLockControls. It will move based off of the controls listed above and will
interact with its environment by ray-casting in the X, Y, and Z direction of its position.
It will collide with the floor and walls and not be able to walk through them. The 
environment is stored inside of the player class and is set by a call to getEnvironment().

The player has some configurable variables:
 - walkSpeed
 - jumpSpeed
 - terminalVelocity
 - height
 - startPosition

The physics of the game will be simple. The player will be affected by gravity and have 
momentum. The momentum will increase as the player falls down and increase as the player 
falls up. The momentum will carry through as a player passes through a port hole, and will 
stop if the player collides with the wall or floor.

#### Environment and Level Building
There will be two key distinct environments: Port hole enabled and port hole disabled. 
The port hole enabled environments will allow a port hole to be places upon it, while the 
disabled will not. The environment will be textures to look realistic and like the inside 
of a building.


[1]: http://turing.slu.edu/~mmeyer71/csci3820/
[2]: https://en.wikipedia.org/wiki/Portal_%28video_game%29
[3]: http://www.valvesoftware.com/
[4]: http://threejs.org/
