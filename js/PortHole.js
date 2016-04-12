
THREE.PortHole = function(scene, color) {

    var portal = new THREE.CubeCamera(0.1, 100, 1024);
    portal.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;

    var geometry = new THREE.RingGeometry(0.0001, 8);
    var material = new THREE.MeshPhongMaterial({
        envMap: portal.renderTarget
    });
    var body = new THREE.Mesh(geometry, material);

    this.shoot = function (position, rotation) {
        body.position.copy(position);
        body.rotation.copy(rotation);
    };

    this.getObject = function () {
        return body;
    };

    this.getViewer = function() {
        return portal;
    };

    this.update = function(renderer, scene) {
        portal.updateCubeMap(renderer, scene)
    };

};
