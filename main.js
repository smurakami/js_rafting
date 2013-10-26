enchant();
window.onload = function() {
    //--------------------
    //  定数群
    //--------------------
    var GAME_WIDTH  = 320;
    var GAME_HEIGHT = 320;
    var GRAVITY = 0.6;

    //--------------------
    //  game 作成
    //--------------------
    var game = new Game();
    game.fps = 60;
    game.keybind(32, "a");

    //--------------------
    //  クラス定義
    //--------------------
    var Boat = enchant.Class.create(enchant.Sprite,{
        initialize: function(){
            enchant.Sprite.call(this, 40, 40);
            this.backgroundColor = "green";
            this.x = 0;
            this.y = 0;
            this.vy = 0;
            this.prev_vy = 0;
            this.on_water = false;
            this.addEventListener("enterframe", this.update);
            game.rootScene.addChild(this);
        },
        update: function(){
            //入力処理
            if(game.input.left) this.x -= 1;
            if(game.input.right) this.x += 1;
            //水面に居るとき
            if(this.on_water){ //自由落下してない
                if(game.input.a || game.input.up) this.vy = -12;
                this.on_water = false;
            }
            // 空中に居るとき
            if(!this.on_water){
                this.vy += GRAVITY;
                this.y += this.vy;
                // 上昇時
                if(this.vy < 0){
                    if(!game.input.a) this.vy = 0;
                }
                // 下降時
                else {
                    // 着地判定
                    if(this.y + this.height > GAME_HEIGHT){
                        this.y = GAME_HEIGHT - this.height;
                        this.vy = 0;
                        this.on_water = true;
                    }
                }
            }
        },
    });
    game.onload = function() {
        boat = new Boat();

    };
    game.start();
};


function rand(num){ return Math.floor(Math.random() * num) };
