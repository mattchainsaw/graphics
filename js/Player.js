/**
 * Adapted from PointerLockControls.js by mrdoob / http://mrdoob.com/
 */

THREE.Player = function (camera) {

    var scope = this;

    var environment = [];

    var height = 10;
    var width = 1;
    var walkSpeed = 400;
    var jumpSpeed = 350;
    var terminalVelocity = 1000;

    var leftPortHole = new THREE.PortHole(scene, 0xff0000);
    var rightPortHole = new THREE.PortHole(scene, 0x0000ff);

    var crossHair = new THREE.Mesh(
        new THREE.RingGeometry(0.01,0.02),
        new THREE.MeshPhongMaterial({color: 0x333333, transparent: true, opacity: 0.5})
    );
    crossHair.position.z -= width / 2;
    //crossHair.position.y += 0.05;

    camera.rotation.set(0, 0, 0);
    camera.add(crossHair);

    var pitchObject = new THREE.Object3D();
    pitchObject.add(camera);

    var yawObject = new THREE.Object3D();
    yawObject.position.y = 2 * height;
    yawObject.add(pitchObject);

    var moveForward = false;
    var moveBackward = false;
    var moveLeft = false;
    var moveRight = false;

    var isOnObject = false;
    var canJump = false;
    var dead = false;

    var prevTime = performance.now();
    var velocity = new THREE.Vector3();
    var PI_2 = Math.PI / 2;
    var raycaster = new THREE.Raycaster();

    var onMouseMove = function (event) {

        if (scope.enabled === false) return;

        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        yawObject.rotation.y -= movementX * 0.002;
        pitchObject.rotation.x -= movementY * 0.002;

        pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));

    };

    var onKeyDown = function (event) {

        switch (event.keyCode) {

            case 38: // up
            case 87: // w
                moveForward = true;
                break;

            case 37: // left
            case 65: // a
                moveLeft = true;
                break;

            case 40: // down
            case 83: // s
                moveBackward = true;
                break;

            case 39: // right
            case 68: // d
                moveRight = true;
                break;

            case 32: // space
                if (canJump === true) velocity.y += jumpSpeed;
                canJump = false;
                break;

        }

    };

    var onKeyUp = function (event) {

        switch (event.keyCode) {

            case 38: // up
            case 87: // w
                moveForward = false;
                break;

            case 37: // left
            case 65: // a
                moveLeft = false;
                break;

            case 40: // down
            case 83: // s
                moveBackward = false;
                break;

            case 39: // right
            case 68: // d
                moveRight = false;
                break;

        }

    };

    var onMouseDown = function (event) {
        if (scope.enabled === false) return;
        raycaster.ray.origin.copy(yawObject.position);
        raycaster.ray.direction = scope.getDirection(new THREE.Vector3(0,0,-1)).normalize();
        raycaster.far = 1000;
        var intersections = raycaster.intersectObjects(environment);
        if (intersections.length > 0) {
            var location = intersections[0];
            var direction = new THREE.Vector3().copy(location.point);
            direction.addScaledVector(location.face.normal, 0.01);
            var rotation = new THREE.Euler(0,0,0,"YXZ");
            rotation.set(location.face.normal.y * -PI_2, location.face.normal.x * PI_2, PI_2);
            console.log(rotation);
            switch (event.which) {
                case 1: // left click
                    leftPortHole.shoot(direction, rotation);
                    break;
                case 3: // right click
                    rightPortHole.shoot(direction, rotation);
                    break;
            }
        }

    };

    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
    document.addEventListener('mousedown', onMouseDown, false);

    this.enabled = false;

    this.getObject = function () {

        return yawObject;

    };

    this.getLeftPortHole = function() {

        return leftPortHole.getObject();

    };

    this.getLeftViewer = function() {

        return leftPortHole.getViewer();

    };

    this.getRightPortHole = function() {

        return rightPortHole.getObject();

    };

    this.getRightViewer = function() {

        return rightPortHole.getViewer();

    };

    this.addEnvironment = function (env) {
        environment = env;
    };

    this.isOnObject = function (boolean) {
        isOnObject = boolean;
        canJump = boolean;
    };

    this.getDirection = function () {

        // assumes the camera itself is not rotated

        var direction = new THREE.Vector3(0, 0, -1);
        var rotation = new THREE.Euler(0, 0, 0, "YXZ");

        return function (v) {

            rotation.set(pitchObject.rotation.x, yawObject.rotation.y, 0);

            v.copy(direction).applyEuler(rotation);

            return v;

        }

    }();

    this.isDead = function () {

        return dead;

    };

    this.restart = function () {
        yawObject.position.set(0, 2 * height, 0);
        dead = false;
        velocity.set(0, 0, 0);
    };

    this.update = function (renderer, scene) {

        if (scope.enabled === false) return;

        var time = performance.now();
        var delta = ( time - prevTime ) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
        if (velocity.y < -terminalVelocity) { // falling
            velocity.y = -terminalVelocity;
        }

        if (moveForward) velocity.z -= walkSpeed * delta;
        if (moveBackward) velocity.z += walkSpeed * delta;

        if (moveLeft) velocity.x -= walkSpeed * delta;
        if (moveRight) velocity.x += walkSpeed * delta;

        if (isOnObject === true) {

            velocity.y = Math.max(0, velocity.y);

        }

        raycaster.ray.origin.copy(yawObject.position);
        raycaster.far = velocity.distanceTo(yawObject.position) * delta + width;
        raycaster.near = 0;
        if (velocity.x > 0)
            raycaster.ray.direction.copy(new THREE.Vector3(1, 0, 0).applyQuaternion(yawObject.quaternion));
        else
            raycaster.ray.direction.copy(new THREE.Vector3(-1, 0, 0).applyQuaternion(yawObject.quaternion));
        var intersections = raycaster.intersectObjects(environment);
        if (intersections.length == 0) {
            yawObject.translateX(velocity.x * delta);
        }

        yawObject.translateY(velocity.y * delta);

        if (velocity.z > 0)
            raycaster.ray.direction.copy(new THREE.Vector3(0, 0, 1).applyQuaternion(yawObject.quaternion));
        else
            raycaster.ray.direction.copy(new THREE.Vector3(0, 0, -1).applyQuaternion(yawObject.quaternion));
        intersections = raycaster.intersectObjects(environment);
        if (intersections.length == 0) {
            yawObject.translateZ(velocity.z * delta);
        }

        if (yawObject.position.y < -50) {

            velocity.y = 0;

            canJump = true;
            dead = true;

        }

        prevTime = time;

        leftPortHole.update(renderer, scene);
        rightPortHole.update(renderer, scene);

    };

};
