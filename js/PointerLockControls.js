/**
 * Adapted from PointerLockControls.js by mrdoob / http://mrdoob.com/
 */

THREE.PointerLockControls = function (camera, height, walkSpeed, jumpSpeed, terminalVelocity) {

    var scope = this;

    var environment = [];

    height = height || 10;
    walkSpeed = walkSpeed || 400;
    jumpSpeed = jumpSpeed || 350;
    terminalVelocity = terminalVelocity || 1000;

    camera.rotation.set(0, 0, 0);

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

    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);

    this.enabled = false;

    this.getObject = function () {

        return yawObject;

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

    var raycaster = new THREE.Raycaster();
    this.update = function () {

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
        raycaster.far = velocity.distanceTo(yawObject.position) * delta + 1;
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

    };

};
