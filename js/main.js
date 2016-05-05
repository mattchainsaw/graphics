/* Matthew Meyer
 * CSCI 3820 Final Project
 */

var WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight,
    ASPECT = WIDTH / HEIGHT;

var PLAYER_HEIGHT = 10,
    PLAYER_WIDTH = 1,
    PLAYER_WALK_SPEED = 300,
    PLAYER_JUMP_SPEED = 250,
    PLAYER_TERMINAL_VELOCITY = 1000;

var scene, cam, renderer, player, objects = [], stats, listener, music, portholeNoise, bloodBackground;
var raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);

var blocker = document.getElementById('blocker');
var instructions = document.getElementById('instructions');
// main()
init();
render();

// Sets up scene, renderer, camera, and UI
function init() {
    scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff));

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(WIDTH, HEIGHT);
    document.body.appendChild(renderer.domElement);

    cam = new THREE.PerspectiveCamera(70, ASPECT, 0.1, 1000);
    listener = new THREE.AudioListener();
    cam.add(listener);

    player = new THREE.Player(cam);
    player.walkSpeed = PLAYER_WALK_SPEED;
    player.jumpSpeed = PLAYER_JUMP_SPEED;
    player.width = PLAYER_WIDTH;
    player.height = PLAYER_HEIGHT;
    player.terminalVelocity = PLAYER_TERMINAL_VELOCITY;

    var audioLoader = new THREE.AudioLoader();
    music = new THREE.Audio(listener);

    audioLoader.load('assets/CreamOnChrome.mp3', function (buf) {
        music.setBuffer(buf);
        music.autoplay = true;
    });
    music.setLoop(true);
    music.setVolume(0.5);

    portholeNoise = new THREE.Audio(listener);
    audioLoader.load('assets/porthole.mp3', function (buf) {
        portholeNoise.setBuffer(buf);
    });

    document.addEventListener('keydown', function (event) {
        if (event.keyCode == 77) { // M
            if (music.isPlaying) music.pause();
            else music.play();
        }
    });

    scene.add(player.getObject());
    scene.add(player.getLeftPortHole());
    scene.add(player.getRightPortHole());
    scene.add(player.getLeftViewer());
    scene.add(player.getRightViewer());

    loadLevel();
    initPointerLock();
    getStats();

    player.addEnvironment(objects);
    player.blood = new THREE.AmbientLight(0xff0000);
    player.blood.intensity = 0;
    scene.add(player.blood);
    bloodBackground = new THREE.Mesh(new THREE.CubeGeometry(900,900,900),
        new THREE.MeshPhongMaterial({
            color: 0xff0000,
            transparent: true,
            side: THREE.BackSide
        })
    );
    bloodBackground.material.opacity = 0;
    scene.add(bloodBackground);
}

function loadLevel() {
    var level = new Level();
    var floor = level.getFloor();
    var north = level.getNorthWalls();
    var east = level.getEastWalls();
    var south = level.getSouthWalls();
    var west = level.getWestWalls();
    scene.add(floor);
    scene.add(north);
    scene.add(east);
    scene.add(south);
    scene.add(west);
    objects.push(floor, north, south, east, west);
    scene.add(level.getSkyBox());

}

function initPointerLock() {
    var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
    if (havePointerLock) {
        var element = document.body;
        var pointerlockchange = function () {
            if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
                player.enabled = true;
                blocker.style.display = 'none';
            } else {
                player.enabled = false;
                blocker.style.display = '-webkit-box';
                blocker.style.display = '-moz-box';
                blocker.style.display = 'box';
                instructions.style.display = '';
            }
        };
        var pointerlockerror = function () {
            instructions.style.display = '';
        };
        // Hook pointer lock state change events
        document.addEventListener('pointerlockchange', pointerlockchange, false);
        document.addEventListener('mozpointerlockchange', pointerlockchange, false);
        document.addEventListener('webkitpointerlockchange', pointerlockchange, false);
        document.addEventListener('pointerlockerror', pointerlockerror, false);
        document.addEventListener('mozpointerlockerror', pointerlockerror, false);
        document.addEventListener('webkitpointerlockerror', pointerlockerror, false);
        instructions.addEventListener('click', function () {
            instructions.style.display = 'none';
            // Ask the browser to lock the pointer
            element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
            if (/Firefox/i.test(navigator.userAgent)) {
                var fullscreenchange = function () {
                    if (document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element) {
                        document.removeEventListener('fullscreenchange', fullscreenchange);
                        document.removeEventListener('mozfullscreenchange', fullscreenchange);
                        element.requestPointerLock();
                    }
                };
                document.addEventListener('fullscreenchange', fullscreenchange, false);
                document.addEventListener('mozfullscreenchange', fullscreenchange, false);
                element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
                element.requestFullscreen();
            } else {
                element.requestPointerLock();
            }
        }, false);
    } else {
        instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
    }
}

function render() {
    stats.begin();

    raycaster.ray.origin.copy(player.getObject().position);
    var intersections = raycaster.intersectObjects(objects);
    player.isOnObject(intersections.length > 0);

    var shotsFired = player.update(renderer, scene);
    if (shotsFired) {
        if (portholeNoise.isPlaying)
            portholeNoise.stop();
        portholeNoise.play();
    }

    if (player.blood.intensity > 0) {
        player.blood.intensity -= 0.01;
        bloodBackground.material.opacity -= 0.0025;
        bloodBackground.material.needsUpdate = true;
    }

    if (player.isDead()) {
        player.restart();
        player.blood.intensity = 2;
        bloodBackground.material.opacity = 0.5;
        bloodBackground.material.needsUpdate = true;
    }
    requestAnimationFrame(render);
    renderer.render(scene, cam);
    stats.end();
}

window.addEventListener('resize', function () {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
    ASPECT = WIDTH / HEIGHT;
    if (cam) {
        cam.aspect = ASPECT;
        cam.updateProjectionMatrix();
    }
    if (renderer) {
        renderer.setSize(WIDTH, HEIGHT);
    }
});

function randomColor() {
    return Math.floor(Math.random() * 16777215);
}

function getStats() {
    stats = new Stats();
    stats.setMode(0); // 0: fps, 1: ms, 2: mb

// align top-left
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    document.body.appendChild(stats.domElement);
}
