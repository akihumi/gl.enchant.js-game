enchant();

var obstacles = [];
var game;
window.addEventListener('load', function(){
    game = new Game(320, 320);
    game.preload('image/earth.png', 'image/sight.png', 'audio/bomb.ogg', 'audio/shot.ogg', 'audio/gameover.ogg', 'audio/bomb1.ogg');
    // game.preload('image/sight.png', 'audio/bomb.ogg', 'audio/shot.ogg', 'audio/gameover.ogg', 'audio/bomb1.ogg');
    game.fps = 24;
    game.score = 0;
    game.alive = true;
    game.life = 3;
    game.pos = true;
    game.addEventListener('load', function(){
        // create sight
        var sight = Sprite(100,100);
        sight.image = game.assets['image/sight.png'];
        sight.frame = 0;
        sight.width = sight.height = 100;
        sight.x = (game.width / 2) - (sight.width / 2) - 1;
        sight.y = (game.height/ 2) - (sight.height / 2);
        sight.opacity = 0.5
        game.rootScene.addChild(sight);
        // create LIFE
        var lifelabel = new Label("");
        lifelabel.x = 8;
        lifelabel.y = 8;
        lifelabel.color = "#ffffff";
        // lifelabel.font = "16px Meta";
        lifelabel.addEventListener('enterframe', function(){
            this.life;
            switch(game.life){
            case 3: this.life = " ★ ★ ★"; break;
            case 2: this.life = "★ ★"; break;
            case 1: this.life = "★"; break;
            case 0: this.life = ""; break;
            }
            this.text = "LIFE: " + this.life;
        });
        game.rootScene.addChild(lifelabel);
        // create score
        var scorelabel = new Label("");
        scorelabel.x = 150;
        scorelabel.y = 8;
        scorelabel.color = "#ffffff";
        // scorelabel.font = "16px Meta";
        scorelabel.addEventListener('enterframe', function(){
            this.text = "SCORE: " + game.score;
        });
        game.rootScene.addChild(scorelabel);
        // create pad
        var pad = new Pad();
        pad.x = 0;
        pad.y = 220;
        pad.opacity =0.5;
        game.rootScene.addChild(pad);
        // create button
        var button = new Button("shot", "light");
        button.color = "#999999";
        button.moveTo(245, 270);
        button.addEventListener('touchstart', function(){
            button.touch = true;
        });
        button.addEventListener('touchend', function(){
            button.touch = false;
        });
        button.addEventListener('enterframe', function(){
            if(button.touch){
                new Shot(scene, game.pos);
                game.assets['audio/shot.ogg'].play();
                game.pos = !(game.pos);
            }
        });
        game.rootScene.addChild(button);
        // create 3D scene
        var scene = new Scene3D();
        // create light
        var light = new DirectionalLight();
        light.directionZ = -1;
        light.color = [1.0, 1.0, 1.0];
        scene.setDirectionalLight(light);
        // create camera
        var camera = new Camera3D();
        camera.centerZ = 200;
        scene.setCamera(camera);
        // create obstacle
        obstacles.init = true;
        for(var i = 0; i < 50; i++){
            var obstacle = new Obstacle(scene);
            obstacle.key = i;
            obstacles.push(obstacle);
        }

        game.keybind(90, "a");
        game.rootScene.addEventListener('enterframe', function(e){
            // なんかかってに始まるので苦肉の策
            if(obstacles.init){
                for(var i = 0; i < obstacles.length; i++){
                    obstacles[i].start();
                }
                obstacles.init = false;
            }
            var input = game.input;
            if(input.left){
                camera.sidestep(0.1); camera.x += 1; camera.centerX = camera.x;
            }else if(input.right){
                camera.sidestep(-0.1); camera.x -= 1; camera.centerX = camera.x;
            }
            if(input.up){ 
                camera.altitude(0.1); camera.y += 1; camera.centerY = camera.y;
            }else if(input.down){
                camera.altitude(-0.1); camera.y -= 1; camera.centerY = camera.y;
            }
            // スペースキーが押されたら弾を発射
            if(input.a){
                new Shot(scene, game.pos);
                game.assets['audio/shot.ogg'].play();
                game.pos = !(game.pos);
            }
        });
    }, false);
    game.start();
}, false);

var Obj = enchant.Class.create(enchant.gl.primitive.Sphere, {
    initialize: function(scene, r){
        if(typeof r === 'undefined'){
            r = 1;
        }
        enchant.gl.primitive.Sphere.call(this, r);
        var theta = 0;
        var matrix = new mat4.create();
        this.az = 0;
        this.scene = scene;
        this.mesh.ambient = [0.3, 0.3, 0.3, 1.0];
        this.mesh.diffuse = [0.5,0.5, 0.5, 1.0];
        this.mesh.specular = [0.5, 0.5, 0.5, 1.0];
        // オブジェクトをゆっくり回転させる
        this.addEventListener('enterframe', function(e){
            mat4.identity(matrix);
            theta += 0.1;
            mat4.rotateY(matrix, theta);
            this.rotation = matrix;
        });
    },
    remove: function(){
        this.scene.removeChild(this);
        delete this;
    },
    start: function(){
        this.scene.addChild(this);
    }
});
var Obstacle = enchant.Class.create(Obj, {
    initialize: function(scene, x, y, z){
        this.camera = scene.getCamera();
        if(typeof x === 'undefined'){
            var diff = Math.floor(Math.random() * 2) == 0 ? 1 : -1;
            x = this.camera.x + Math.floor(Math.random() * 20 *  diff);
        }
        if(typeof y === 'undefined'){
            var diff = Math.floor(Math.random() * 2) == 0 ? 1 : -1;
            y = this.camera.y + Math.floor(Math.random() * 20 * diff);
        }
        if(typeof z === 'undefined'){
            z = 100 + Math.floor(Math.random() * 200);
        }
        // 大きさはランダムで
        this.r = (Math.random() * 3).toFixed(1);
        Obj.call(this, scene, this.r);
        this.x = x;
        this.y = y;
        this.z = z;
        this.mesh.setBaseColor("#7fffd4");

        var userAgent = window.navigator.userAgent.toLowerCase();
        if (userAgent.indexOf('chrome') == -1) {
            this.mesh.texture = new Texture(game.assets['image/earth.png']);
            this.mesh.texture.ambient = [0.3, 0.3, 0.3, 1.0];
            this.mesh.texture.diffuse = [0.5, 0.5, 0.5, 1.0];
            this.mesh.texture.specular = [0.5, 0.5, 0.5, 1.0];
        }
        this.addEventListener('enterframe', function(e){
            if(game.score < 50){
                this.az -= 0.3;
            }else if(game.score < 100){
                this.az -= 0.5;
            }else if(game.score < 200){
                this.az -= 1;
            }else{
                this.az -= 1.5;
            }
            this.z += this.az;
            if(this.z < this.camera.z){
                // 障害物に当たると終了
                if(Math.abs(this.x - this.camera.x) < 2 && Math.abs(this.y - this.camera.y) < 2){
                    game.life--;
                    if(game.life == 0){
                        if(game.alive){
                            setTimeout(function(){
                                game.assets['audio/gameover.ogg'].play();
                                game.end(game.score, "あなたのスコアは" + game.score + "です");
                                game.alive = false;
                            }, 100);
                        }
                    }else{
                        if(game.alive){
                            game.assets['audio/bomb1.ogg'].play();
                        }
                    }
                }
                var o = null;
                if(this.key == 0){
                    o = new Obstacle(scene, this.camera.x, this.camera.y, 200);
                }else{
                    o = new Obstacle(scene);
                }
                o.key = this.key;
                obstacles[this.key] = o;
                obstacles[this.key].start();
                this.remove();
            }
        });
    },
    key: 0,
});

var Shot = enchant.Class.create(Obj, {
    initialize: function(scene, flag){
        var posx = flag ? 5 : -5;
        var dx = flag ? -0.2 : 0.2;
        Obj.call(this, scene);
        this.camera = scene.getCamera();
        this.x = this.camera.x + posx;
        this.y = this.camera.y;
        this.z = this.camera.z + 10;
        this.mesh.setBaseColor("#f16b5c");
        this.addEventListener('enterframe', function(e){
            this.az += 1.5;
            this.z += this.az;
            if(this.x != this.camera.x){
                this.x += dx;
            }
            for(var i = 0; i < obstacles.length; i++){
                var ob = obstacles[i];
                var hitarea = 20;
                if(this.bounding.toBS(ob.bounding) < hitarea){
                    var o = null;
                    if(this.key == 0){
                        o = new Obstacle(scene, this.camera.x, this.camera.y, 200);
                    }else{
                        o = new Obstacle(scene);
                    }
                    o.key = ob.key;
                    obstacles[ob.key] = o;
                    obstacles[ob.key].start();
                    ob.remove();
                    this.remove();
                    game.score += 1;
                    game.assets['audio/bomb.ogg'].play();
                }
            }
            if(this.z > 500){
                this.remove();
            }
        });
        this.start();
    }
});
