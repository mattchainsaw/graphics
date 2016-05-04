/* Matthew Meyer
 */

/* Level input:
 * -1 = empty without walls blocking view
 * 0 = empty
 * 1 = normal floor (with walls if necessary
 * 2 =
 */
var boring = [
    [1, 1, 1, 1],
    [-1, -1, -1, -1],
    [1, 0, 0, 1],
    [1, 1, 1, 1]
];

var Level = function (arr, offset) {

    var layout = arr || boring;
    var size = offset || 50;

    var wallMaterial = getWallMaterial(),
        floorMaterial = getFloorMaterial();

    var geos = getGeometries(layout, size);

    var floorGeometry = geos[0],
        northGeometry = geos[1],
        eastGeometry = geos[2],
        southGeometry = geos[3],
        westGeometry = geos[4];

    this.getFloor = function () {
        return new THREE.Mesh(floorGeometry, floorMaterial);
    };

    this.getNorthWalls = function () {
        return new THREE.Mesh(northGeometry, wallMaterial);
    };

    this.getEastWalls = function () {
        return new THREE.Mesh(eastGeometry, wallMaterial);
    };

    this.getSouthWalls = function () {
        return new THREE.Mesh(southGeometry, wallMaterial);
    };

    this.getWestWalls = function () {
        return new THREE.Mesh(westGeometry, wallMaterial);
    };

};

/* returns an array
 * arr[0] = floors
 * arr[1] = North walls
 * arr[2] = East Walls
 * arr[3] = South Walls
 * arr[4] = West Walls
 */
var getGeometries = function (arr, offset) {
    var floorGeometry = new THREE.Geometry();
    var north = new THREE.Geometry();
    var east = new THREE.Geometry();
    var south = new THREE.Geometry();
    var west = new THREE.Geometry();

    for (var i = 0; i < arr.length; i++) {
        for (var j = 0; j < arr[i].length; j++) {

            if (arr[i][j] == 1) { // add floor and walls
                var floor = new THREE.Mesh(new THREE.PlaneGeometry(offset, offset));
                floor.translateX(j * offset);
                floor.translateZ(i * offset);
                floor.rotateX(-Math.PI / 2);
                floor.updateMatrix();
                floorGeometry.merge(floor.geometry, floor.matrix);


                if (i == 0 || (i > 0 && arr[i-1][j] == 0)) { // north - add front wall
                    var fw = new THREE.Mesh(new THREE.PlaneGeometry(offset, offset));
                    fw.translateX(j * offset);
                    fw.translateY(offset / 2);
                    fw.translateZ(i * offset - offset / 2);
                    fw.updateMatrix();
                    north.merge(fw.geometry, fw.matrix);
                }
                if (i + 1 == arr.length || (i + 1 < arr.length && arr[i+1][j] == 0)) { // south - add back wall
                    var bw = new THREE.Mesh(new THREE.PlaneGeometry(offset, offset));
                    bw.translateX(j * offset);
                    bw.translateY(offset / 2);
                    bw.translateZ(i * offset + offset / 2);
                    bw.rotateY(Math.PI);
                    bw.updateMatrix();
                    south.merge(bw.geometry, bw.matrix);
                }
                if (j == 0 || (j != 0 && arr[i][j-1] == 0)) { // east - add left wall
                    var lw = new THREE.Mesh(new THREE.PlaneGeometry(offset, offset));
                    lw.translateX(j * offset - offset / 2);
                    lw.translateY(offset / 2);
                    lw.translateZ(i * offset);
                    lw.rotateY(Math.PI / 2);
                    lw.updateMatrix();
                    east.merge(lw.geometry, lw.matrix);
                }
                if (j + 1 == arr[i].length || (j + 1 < arr[i].length && arr[i][j+1] == 0)) { // west - add right wall
                    var rw = new THREE.Mesh(new THREE.PlaneGeometry(offset, offset));
                    rw.translateX(j * offset + offset / 2);
                    rw.translateY(offset / 2);
                    rw.translateZ(i * offset);
                    rw.rotateY(-Math.PI / 2);
                    rw.updateMatrix();
                    west.merge(rw.geometry, rw.matrix);
                }
            }
        }
    }
    return [floorGeometry, north, east, south, west];
};

var texLoader = new THREE.TextureLoader();

var getWallMaterial = function () {

    var wallTex = texLoader.load('assets/wall.jpg');
    wallTex.minFilter = THREE.LinearMipMapLinearFilter;
    wallTex.wrapS = THREE.RepeatWrapping;
    wallTex.wrapT = THREE.RepeatWrapping;
    wallTex.repeat.set(3, 3);

    var wallMat = new THREE.MeshPhongMaterial({side: THREE.DoubleSide});
    wallMat.map = wallTex;

    return wallMat;
};

var getFloorMaterial = function () {

    var floorTex = texLoader.load('assets/floor.jpg');
    floorTex.minFilter = THREE.LinearFilter;
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(3, 3);

    var floorMat = new THREE.MeshPhongMaterial({side: THREE.DoubleSide});
    floorMat.map = floorTex;

    return floorMat;
};