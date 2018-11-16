import '../css/main.css'
require("expose-loader?$!jquery");

// 禁止页面下滑
document.body.addEventListener('touchmove',function(e){
    e.preventDefault()
  },{ passive:false })

var classicBtn = document.getElementsByClassName('classic-model')[0];
var puzzlesBtn = document.getElementsByClassName('puzzles-model')[0];

classicBtn.addEventListener('click', function(){
    document.getElementsByClassName('index-wrap')[0].style.display="none";
    new ClassicGame();
})

var Util = {
    getElementByAttr: function(className,attr,value) {
        var aElements=document.getElementsByClassName(className);
        var aEle=[];
        for(var i=0;i<aElements.length;i++)
        {
            if(aElements[i].getAttribute(attr)==value)
                aEle.push( aElements[i] );
        }
        return aEle;
    },

    getSlideAngle: function(dx, dy) {
        return Math.atan2(dy, dx) * 180 / Math.PI; 
    },

    // 根据起点和终点返回方向 1：向上，2：向下，3：向左，4：向右,0：未滑动
    getSlideDirection: function(startX, startY, endX, endY) {
        console.log(11);
        var dy = endY - startY; 
        var dx = endX - startX;
        var dyRem = Math.floor(dy/46.875);
        var dxRem = Math.floor(dx/46.875);

        var resultObj = {
            direction: 0,
            dyRem: dyRem,
            dxRem: dxRem
        };
        //如果滑动距离太短 
        if(Math.abs(dx) < 2 && Math.abs(dy) < 2) { 
            return resultObj; 
        } 
        var angle = Util.getSlideAngle(dx, dy); 
        if(angle >= -45 && angle < 45) { 
            resultObj.direction = 4; 
        }else if (angle >= 45 && angle < 135) { 
            resultObj.direction = 1; 
        }else if (angle >= -135 && angle < -45) { 
            resultObj.direction = 2; 
        } 
        else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) { 
            resultObj.direction = 3; 
        } 
        return resultObj; 
    },
};

// 经典模式
function ClassicGame () {
    this.speed = 600;
    this.score = 0;
    // 起始
    this.x = 5;
    this.y = 0;
    // 掉落方块随机数 (r1:哪种图形  r2:哪种形状)
    this.r1 = 0;
    this.r2 = 0;
    this.r0 = 0; // 颜色
    // 预览方块随机数
    this.r3 = 0;
    this.r4 = 0;
    this.r5 = 0;

    this.longClick = 0;
    this.timeOutEvent = 0;
    
    this.timer = null;
    this.gameover = false;
    this.remove = false

    // 存放网格中已有的格子位置
    this.blockArea = [];
    // 定义图形
    this.tetris = [
        // T 的四个形状
        [
            // _|_，四个格子的坐标
            [
                [this.x, this.y - 1],
                [this.x - 1, this.y],
                [this.x, this.y],
                [this.x + 1, this.y]
            ],
            // T，四个格子的坐标
            [
                [this.x - 1, this.y - 1],
                [this.x, this.y - 1],
                [this.x + 1, this.y - 1],
                [this.x, this.y]
            ],
            // -|，四个格子的坐标
            [
                [this.x, this.y - 2],
				[this.x, this.y - 1],
				[this.x - 1, this.y - 1],
				[this.x, this.y]
            ],
            // |-，四个格子的坐标
            [
                [this.x, this.y - 2],
				[this.x, this.y - 1],
				[this.x + 1, this.y - 1],
				[this.x, this.y]
            ],
        ],
        // L 的四个形状
        [
            // L，四个格子的坐标
            [
                [this.x, this.y - 2],
                [this.x, this.y - 1],
                [this.x, this.y],
                [this.x + 1, this.y]
            ],
            // __|
            [
                [this.x + 1, this.y - 1],
                [this.x - 1, this.y],
                [this.x, this.y],
                [this.x + 1, this.y]
            ],
            // 7
            [
                [this.x - 1, this.y - 2],
                [this.x, this.y - 2],
                [this.x, this.y - 1],
                [this.x, this.y]
            ],
            // 、--
            [
                [this.x, this.y],
                [this.x, this.y + 1],
                [this.x + 1, this.y],
                [this.x + 2, this.y]
            ]
        ],
        // _| 的四个形状
        [
            // _|
            [
                [this.x, this.y - 2],
                [this.x, this.y - 1],
                [this.x, this.y],
                [this.x - 1, this.y]
            ],
            // |____
            [
                [this.x - 1, this.y - 1],
                [this.x - 1, this.y],
                [this.x, this.y],
                [this.x + 1, this.y]
            ],
            // |`
            [
                [this.x + 1, this.y - 2],
                [this.x, this.y - 2],
                [this.x, this.y - 1],
                [this.x, this.y]
            ],
            // ---、
            [
                [this.x - 1, this.y - 1],
                [this.x, this.y - 1],
                [this.x + 1, this.y - 1],
                [this.x + 1, this.y]
            ]
        ],
        // | 的四个形状
        [
            [
				[this.x, this.y - 3],
				[this.x, this.y - 2],
				[this.x, this.y - 1],
				[this.x, this.y]
			], //ok
			[
				[this.x - 2, this.y],
				[this.x - 1, this.y],
				[this.x, this.y],
				[this.x + 1, this.y]
			], //ok
			[
				[this.x, this.y - 3],
				[this.x, this.y - 2],
				[this.x, this.y - 1],
				[this.x, this.y]
			], //ok
			[
				[this.x - 2, this.y],
				[this.x - 1, this.y],
				[this.x, this.y],
				[this.x + 1, this.y]
			] //ok
        ],
        // == 的四个形状
        [
            [
				[this.x - 1, this.y - 1],
				[this.x, this.y - 1],
				[this.x - 1, this.y],
				[this.x, this.y]
            ],
            [
				[this.x - 1, this.y - 1],
				[this.x, this.y - 1],
				[this.x - 1, this.y],
				[this.x, this.y]
            ],
            [
				[this.x - 1, this.y - 1],
				[this.x, this.y - 1],
				[this.x - 1, this.y],
				[this.x, this.y]
            ],
            [
				[this.x - 1, this.y - 1],
				[this.x, this.y - 1],
				[this.x - 1, this.y],
				[this.x, this.y]
			]
        ],
        // z 的四个形状
        [
            [
				[this.x - 1, this.y - 1],
				[this.x, this.y - 1],
				[this.x, this.y],
				[this.x + 1, this.y]
			],
			[
				[this.x, this.y - 2],
				[this.x, this.y - 1],
				[this.x - 1, this.y - 1],
				[this.x - 1, this.y]
			],
			[
				[this.x - 1, this.y - 1],
				[this.x, this.y - 1],
				[this.x, this.y],
				[this.x + 1, this.y]
			],
			[
				[this.x, this.y - 2],
				[this.x, this.y - 1],
				[this.x - 1, this.y - 1],
				[this.x - 1, this.y]
			]
        ]
    ];
    // 随机颜色
    this.colors = ['#037ef3', '#f85a40', '#30c39e', '#a51890', '#f48924', '#ffc845'];
    this.isDown = '';

    
    // 显示游戏区域所有网格
    this.initGrids();
    // 随机数
    this.initRandom();

    var that = this;
    
    function go() {
        that.init();
		that.bindEvents();
        that.isDown = that.autoMove();
        $.when(that.isDown).then(function() {
            var nextBlocks = Util.getElementByAttr('block','next','true');
            for(var i = 0; i < nextBlocks.length; i++){
                nextBlocks[i].parentNode.removeChild(nextBlocks[i]); 
        　　 }
			go();
		})
	}
    go();
    
    //滑动处理 
    var startX, startY; 
    document.addEventListener('touchstart',function (ev) { 
        startX = ev.touches[0].pageX; 
        startY = ev.touches[0].pageY;
    }, false); 

    document.addEventListener('touchmove',function (ev) { 
        var endX, endY; 
        endX = ev.changedTouches[0].pageX; 
        endY = ev.changedTouches[0].pageY;

        var dx = (endX - startX) / 46.875;
        var dxRem = Math.floor(dx);
        
        var resultObj = Util.getSlideDirection(startX, startY, endX, endY); 
        
        if (Math.abs(dxRem) >= 1) {
            if (resultObj.direction === 3) {
                startX = endX;
                that.moveLeft(that, dxRem);
                
            } else if (resultObj.direction === 4) {
                startX = endX;
                that.moveRight(that, dxRem);
            }
        } else {
            return;
        }
        
        
      }, false);

      document.addEventListener('touchend',function (ev) { 
        var endX, endY; 
        endX = ev.changedTouches[0].pageX; 
        endY = ev.changedTouches[0].pageY;
        var resultObj = Util.getSlideDirection(startX, startY, endX, endY); 

        if (resultObj.direction === 1 && resultObj.dyRem > 5) {
            that.moveDownFaster(that, 'touch');
        } else if (resultObj.direction === 2 && resultObj.dyRem < -2) {
            that.moveRotate(that);
        }
        
      }, false);
}

ClassicGame.prototype.init = function() {
    // 根据随机数产生掉落的方块
    this.initBlock();
    // 根据随机数产生预览的方块
    this.initRandom();
    this.initNext();
}

ClassicGame.prototype.initGrids = function() {
    // 显示分数
    var scoreWrap = document.getElementsByClassName('score-wrap');
    scoreWrap[0].style.display = 'block';
    var score = document.getElementsByClassName('score');
    score[0].innerHTML = "0";

    for(var i = 0; i < 22; i++) {
		for(var j = 0; j < 15; j++) {
            var grid = document.createElement("div");
            grid.style.cssText = "top:"+i+"rem;left:"+j+"rem;";
            grid.className = 'grid';
            document.getElementsByClassName('gamp-wrap')[0].appendChild(grid);
		}
	}
}

ClassicGame.prototype.initRandom = function() {
    this.r3 = Math.floor(Math.random() * 6);
    this.r4 = Math.floor(Math.random() * 4);
    this.r5 = Math.floor(Math.random() * 6);
    
    // this.r3 = 1;
    // this.r4 = 0;
}

ClassicGame.prototype.initBlock = function() {
    this.r1 = this.r3;
    this.r2 = this.r4;
    this.r0 = this.r5;
    for (var i = 0; i < 4; i++) {
        var block = document.createElement("div");
        block.style.cssText = "top:"+this.tetris[this.r1][this.r2][i][1]+"rem;left:"+this.tetris[this.r1][this.r2][i][0]+"rem;background:"+this.colors[this.r0];
        block.className = 'block';
        block.setAttribute("move","true");
        document.getElementsByClassName('gamp-wrap')[0].appendChild(block);
    }
}

ClassicGame.prototype.initNext = function() {
    for (var i = 0; i < 4; i++) {
        var next = document.createElement("div");
        var top = this.tetris[this.r3][this.r4][i][1] + 2.5;
        var left = this.tetris[this.r3][this.r4][i][0] - 4;
        next.style.cssText = "top:"+top/2+"rem;left:"+left/2+"rem;background:"+this.colors[this.r5];
        next.className = 'block';
        next.setAttribute("next","true");
        document.getElementsByClassName('next-warp')[0].appendChild(next);
    }
}

ClassicGame.prototype.bindEvents = function() {
    // var btnLeft = document.getElementsByClassName('btn-left')[0];
    // var btnRight = document.getElementsByClassName('btn-right')[0];
    // var btnUp = document.getElementsByClassName('btn-up')[0];
    // var btnDown = document.getElementsByClassName('btn-down')[0];

    var that = this;

    // btnLeft.onclick = function() {
    //     that.moveLeft(that);
    // }
    // btnRight.onclick = function() {
    //     that.moveRight(that);
    // }
    // btnUp.onclick = function() {
    //     that.moveRotate(that);
    // }

    $(".btn-down").on({
        touchstart: function(e) {
            if(that.timeOutEvent) {
                clearTimeout(that.timeOutEvent);
            }
            that.longClick = 0;
            that.timeOutEvent =setTimeout(function(){
                that.longClick=1;
                that.moveDownFaster(that);
            },500)
            e.preventDefault();
        },
        touchend: function(e){
            clearTimeout(that.timeOutEvent);
            if(that.timeOutEvent != 0){//点击
                that.speed = 600;
            }
            return false;
        }
    })
    
    window.onkeydown = function(e) {
		if(e.keyCode == 37) {
			that.moveLeft(that);
		} else if (e.keyCode == 39) {
            that.moveRight(that);
        } else if (e.keyCode == 38) {
            that.moveRotate(that);
        } else if(e.keyCode == 40) {
			that.moveDownFaster(that);
		}
    };

    window.onkeyup = function(e) {
        if(e.keyCode == 40) {
			that.speed = 600;
		}
    }
}

// 左右
ClassicGame.prototype.canMoveLeftOrRight = function(i, x) {
    var top = this.tetris[this.r1][this.r2][i][1]; 
    var left = this.tetris[this.r1][this.r2][i][0] + x; // 下一个位置的left
    var blockPosition = top+'rem'+left+'rem';

    if (left>= 0 && left<= 14) {
        if(this.blockArea.indexOf(blockPosition) == -1) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

ClassicGame.prototype.moveLeft = function(that, dxRem) {
    // this 指向按钮
    var num = -1;
    if (dxRem) {
        num = dxRem;
    }
    var canML0 = that.canMoveLeftOrRight(0, num);
    var canML1 = that.canMoveLeftOrRight(1, num);
    var canML2 = that.canMoveLeftOrRight(2, num);
    var canML3 = that.canMoveLeftOrRight(3, num);

    if (canML0 && canML1 && canML2 && canML3) {
        that.x += num;
        that.updateTetris();

        var moveBlocks = Util.getElementByAttr('block','move','true');
        for(var i = 0; i < moveBlocks.length; i++){
            moveBlocks[i].style.cssText = "top:"+that.tetris[that.r1][that.r2][i][1]+"rem;left:"+that.tetris[that.r1][that.r2][i][0]+"rem;background:"+that.colors[that.r0];
    　　 }
    }

}
ClassicGame.prototype.moveRight = function(that, dxRem) {
    var num = 1;
    if (dxRem) {
        num = dxRem;
    }
    var canMR0 = this.canMoveLeftOrRight(0, num);
    var canMR1 = this.canMoveLeftOrRight(1, num);
    var canMR2 = this.canMoveLeftOrRight(2, num);
    var canMR3 = this.canMoveLeftOrRight(3, num);

    if (canMR0 && canMR1 && canMR2 && canMR3) {
        that.x += num;
        that.updateTetris();

        var moveBlocks = Util.getElementByAttr('block','move','true');
        for(var i = 0; i < moveBlocks.length; i++){
            moveBlocks[i].style.cssText = "top:"+that.tetris[that.r1][that.r2][i][1]+"rem;left:"+that.tetris[that.r1][that.r2][i][0]+"rem;background:"+that.colors[that.r0];
    　　 }
    }
}

// 旋转
ClassicGame.prototype.canMoveRotate = function(i) {
    var top = this.tetris[this.r1][this.r2][i][1]; 
    var left = this.tetris[this.r1][this.r2][i][0];
    var blockPosition = top+'rem'+left+'rem';

    if (left>= 0 && left<= 14 && top <= 21) {
        if(this.blockArea.indexOf(blockPosition) == -1) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

ClassicGame.prototype.moveRotate = function(that) {
    var canR0 = that.canMoveRotate(0);
    var canR1 = that.canMoveRotate(1);
    var canR2 = that.canMoveRotate(2);
    var canR3 = that.canMoveRotate(3);

    if (canR0 && canR1 && canR2 && canR3) {
        that.r2 -= 1;
        if(that.r2 < 0) {
			that.r2 = 3
        }
        var moveBlocks = Util.getElementByAttr('block','move','true');
        for(var i = 0; i < moveBlocks.length; i++){
            moveBlocks[i].style.cssText = "top:"+that.tetris[that.r1][that.r2][i][1]+"rem;left:"+that.tetris[that.r1][that.r2][i][0]+"rem;background:"+that.colors[that.r0];
    　　 }
    }
    
}

// 下落
ClassicGame.prototype.canMoveDown = function(i, y) {
    var top = this.tetris[this.r1][this.r2][i][1] + y; // 下一个位置的top
    var left = this.tetris[this.r1][this.r2][i][0];
    var blockPosition = top+'rem'+left+'rem';

    if (top <= 21) {
        if(this.blockArea.indexOf(blockPosition) == -1) {
            return true;
        } else {
            if(top <= 1) {
                this.gameover = true;
            } else {
                return false;
            }
        }
    } else {
        return false;
    }
}

ClassicGame.prototype.autoMove = function() {
    var that = this;
    return $.Deferred(function(stop) {
        function move() {
            that.timer = setTimeout(function() {
                // 判断每个格子是否可以往下移
                var canM0 = that.canMoveDown(0, 1);
                var canM1 = that.canMoveDown(1, 1);
                var canM2 = that.canMoveDown(2, 1);
                var canM3 = that.canMoveDown(3, 1);
    
                if (that.gameover == true) {
                    var grids = document.getElementsByClassName('grid');
                    for(var i = grids.length - 1; i >= 0; i--) { 
                        grids[i].parentNode.removeChild(grids[i]); 
                    }
                    var blocks = document.getElementsByClassName('block');
                    for(var i = blocks.length - 1; i >= 0; i--) { 
                        blocks[i].parentNode.removeChild(blocks[i]); 
                    }
                    var score = document.getElementsByClassName('score');
                    score.innerHTML = "0";
                    document.getElementsByClassName('index-wrap')[0].style.display="flex";

                    // 生成图片
                    that.drawImg();

                    var scoreWrap = document.getElementsByClassName('score-wrap');
                    scoreWrap[0].style.display = 'none';
                    
                } else if (canM0 && canM1 && canM2 && canM3) {
                    that.y += 1;
                    that.updateTetris();
    
                    var moveBlocks = Util.getElementByAttr('block','move','true');
                    for(var i = 0; i < moveBlocks.length; i++){
                        moveBlocks[i].style.cssText = "top:"+that.tetris[that.r1][that.r2][i][1]+"rem;left:"+that.tetris[that.r1][that.r2][i][0]+"rem;background:"+that.colors[that.r0];
                　　 }
    
                    move();
                } else {
                    // 不可以moveDown了
                    that.y = 0;
                    that.x = 5;
                    that.updateTetris();
                    that.isClean()
                    
                    setTimeout(function() {
                        if(that.remove == true) {
                            that.remove = false

                            stop.resolve()
                        } else {
                            stop.resolve()
                        }
                    }, 10)
                }
        
            }, that.speed)
        }
        move();
    })
}

ClassicGame.prototype.moveDownFaster = function(that, type) {
    that.speed = 50;
    if (type == 'touch') {
        $.when(that.isDown).then(function() {
            that.speed = 600;
        })
    }
   
	
}

ClassicGame.prototype.isClean = function() {
    var that = this;
    $('.block[move=true]').each(function() {
        var style = $(this).attr("style");
        var top = style.split(';')[0].replace(/[^0-9]/ig,"") + 'rem';
        var comTop = style.split(';')[0].replace(/[^0-9]/ig,"");
        var left = style.split(';')[1].replace(/[^0-9]/ig,"") + 'rem';
        that.blockArea.push(top+''+left);
        $(this).attr('top', top);
        $(this).attr('move', false);
        if($('.block[top=' + top + ']').length == 15) {
            that.score += 100;
            that.remove = true;
            var r0 = that.removes(0, top);
			var r1 = that.removes(1, top);
			var r2 = that.removes(2, top);
			var r3 = that.removes(3, top);
			var r4 = that.removes(4, top);
			var r5 = that.removes(5, top);
			var r6 = that.removes(6, top);
			var r7 = that.removes(7, top);
			var r8 = that.removes(8, top);
            var r9 = that.removes(9, top);
            var r10 = that.removes(10, top);
            var r11 = that.removes(11, top);
            var r12 = that.removes(12, top);
            var r13 = that.removes(13, top);
            var r14 = that.removes(14, top);
            $.when(r0, r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13, r14).then(function() {
				$('.score').text(that.score);
				$('.block[move=false]').each(function() {
                    var style1 = $(this).attr("style");
                    var top1 = style1.split(';')[0].replace(/[^0-9]/ig,"") + 'rem';
                    var bg1 = style1.split(';')[2];
                    var comTop1 = style1.split(';')[0].replace(/[^0-9]/ig,"");
					if(parseInt(comTop1) < parseInt(comTop)) {
						var left1 = style1.split(';')[1].replace(/[^0-9]/ig,"") + 'rem';
						var index = that.blockArea.indexOf(top1 + '' + left1);
						that.blockArea.splice(index, 1);
                        var nextTop = parseInt(comTop1) + 1 + 'rem';
                        var style2 = "top:" + nextTop + "; left:" + left1 + ";" +bg1;
                        $(this).attr("style", style2);
						that.blockArea.push(nextTop + '' + left1);
						$(this).attr('top', nextTop);
					}
				})
			})


        }
    })
}

ClassicGame.prototype.removes = function(i, t) {
	var that = this;
	return $.Deferred(function(remove) {
        var style2 = $('.block[top=' + t + ']').eq(i).attr("style");
		var top2 = style2.split(';')[0].replace(/[^0-9]/ig,"") + 'rem';
		var left2 = style2.split(';')[1].replace(/[^0-9]/ig,"") + 'rem';
		var index = that.blockArea.indexOf(top2 + '' + left2)
		that.blockArea.splice(index, 1)
		$('.block[top=' + t + ']').eq(i).animate({
			'opacity': '0'
		}, 100).animate({
			'opacity': '1'
		}, 100).animate({
			'opacity': '0'
		}, 100).animate({
			'opacity': '1'
		}, 100).animate({
			'opacity': '0'
		}, 500, function() {
			$(this).remove()
			remove.resolve()
		})
	})
}

ClassicGame.prototype.cleanBlockArea = function(waitDelBlocks, top) {
    for(var i = 0; i < waitDelBlocks.length; i++){
        var left = waitDelBlocks[i].style.left;
        var index = this.blockArea.indexOf(top + '' + left);
        if (index > -1) {
            this.blockArea.splice(index, 1);
        }
    }
    return true;
}

ClassicGame.prototype.cleanBlocks = function(waitDelBlocks, top) {
    if (waitDelBlocks.length) {
        for(var i = 0; i < waitDelBlocks.length; i++){
            if (waitDelBlocks[i].parentNode && waitDelBlocks[i].parentNode.children) {
                waitDelBlocks[i].parentNode.removeChild(waitDelBlocks[i]);
            }
            
        }
        return true;
    }
    
}

ClassicGame.prototype.updateTetris = function() {
    // 定义图形
    this.tetris = [
        // T 的四个形状
        [
            // _|_，四个格子的坐标
            [
                [this.x, this.y - 1],
                [this.x - 1, this.y],
                [this.x, this.y],
                [this.x + 1, this.y]
            ],
            // T，四个格子的坐标
            [
                [this.x - 1, this.y - 1],
                [this.x, this.y - 1],
                [this.x + 1, this.y - 1],
                [this.x, this.y]
            ],
            // -|，四个格子的坐标
            [
                [this.x, this.y - 2],
				[this.x, this.y - 1],
				[this.x - 1, this.y - 1],
				[this.x, this.y]
            ],
            // |-，四个格子的坐标
            [
                [this.x, this.y - 2],
				[this.x, this.y - 1],
				[this.x + 1, this.y - 1],
				[this.x, this.y]
            ],
        ],
        // L 的四个形状
        [
            // L，四个格子的坐标
            [
                [this.x, this.y - 2],
                [this.x, this.y - 1],
                [this.x, this.y],
                [this.x + 1, this.y]
            ],
            // __|
            [
                [this.x + 1, this.y - 1],
                [this.x - 1, this.y],
                [this.x, this.y],
                [this.x + 1, this.y]
            ],
            // 7
            [
                [this.x - 1, this.y - 2],
                [this.x, this.y - 2],
                [this.x, this.y - 1],
                [this.x, this.y]
            ],
            // 、--
            [
                [this.x, this.y],
                [this.x, this.y + 1],
                [this.x + 1, this.y],
                [this.x + 2, this.y]
            ]
        ],
        // _| 的四个形状
        [
            // _|
            [
                [this.x, this.y - 2],
                [this.x, this.y - 1],
                [this.x, this.y],
                [this.x - 1, this.y]
            ],
            // |____
            [
                [this.x - 1, this.y - 1],
                [this.x - 1, this.y],
                [this.x, this.y],
                [this.x + 1, this.y]
            ],
            // |`
            [
                [this.x + 1, this.y - 2],
                [this.x, this.y - 2],
                [this.x, this.y - 1],
                [this.x, this.y]
            ],
            // ---、
            [
                [this.x - 1, this.y - 1],
                [this.x, this.y - 1],
                [this.x + 1, this.y - 1],
                [this.x + 1, this.y]
            ]
        ],
        // | 的四个形状
        [
            [
				[this.x, this.y - 3],
				[this.x, this.y - 2],
				[this.x, this.y - 1],
				[this.x, this.y]
			], //ok
			[
				[this.x - 2, this.y],
				[this.x - 1, this.y],
				[this.x, this.y],
				[this.x + 1, this.y]
			], //ok
			[
				[this.x, this.y - 3],
				[this.x, this.y - 2],
				[this.x, this.y - 1],
				[this.x, this.y]
			], //ok
			[
				[this.x - 2, this.y],
				[this.x - 1, this.y],
				[this.x, this.y],
				[this.x + 1, this.y]
			] //ok
        ],
        // == 的四个形状
        [
            [
				[this.x - 1, this.y - 1],
				[this.x, this.y - 1],
				[this.x - 1, this.y],
				[this.x, this.y]
            ],
            [
				[this.x - 1, this.y - 1],
				[this.x, this.y - 1],
				[this.x - 1, this.y],
				[this.x, this.y]
            ],
            [
				[this.x - 1, this.y - 1],
				[this.x, this.y - 1],
				[this.x - 1, this.y],
				[this.x, this.y]
            ],
            [
				[this.x - 1, this.y - 1],
				[this.x, this.y - 1],
				[this.x - 1, this.y],
				[this.x, this.y]
			]
        ],
        // z 的四个形状
        [
            [
				[this.x - 1, this.y - 1],
				[this.x, this.y - 1],
				[this.x, this.y],
				[this.x + 1, this.y]
			],
			[
				[this.x, this.y - 2],
				[this.x, this.y - 1],
				[this.x - 1, this.y - 1],
				[this.x - 1, this.y]
			],
			[
				[this.x - 1, this.y - 1],
				[this.x, this.y - 1],
				[this.x, this.y],
				[this.x + 1, this.y]
			],
			[
				[this.x, this.y - 2],
				[this.x, this.y - 1],
				[this.x - 1, this.y - 1],
				[this.x - 1, this.y]
			]
        ]
    ];
}

ClassicGame.prototype.drawImg = function() {

    var canvas = document.createElement('canvas');
    canvas.width = "700";
    canvas.height = "980";
    var ctx = canvas.getContext("2d");
    ctx.rect(0,0, 700, 980);
    ctx.fillStyle = "#fff"
    ctx.fill();

    function loadImg(src) {
        var paths = Array.isArray(src) ? src : [src]
        var promise = paths.map((path) => {
            return new Promise((resolve, reject) => {
                var img = new Image()
                img.setAttribute("crossOrigin", 'anonymous')
                img.src = path
                img.onload = () => {
                    resolve(img)
                }
                img.onerror = (err) => {
                    alert('图片加载失败')
                }
            })
          })
          return Promise.all(promise)
    }

    var that = this;

    loadImg([
        'http://h0.hucdn.com/open/201846/021b246efa45ab41_470x478.png',
    ]).then(([img1])=> {
        ctx.drawImage(img1, 200, 560, 300, 300); 
        ctx.fillStyle = '#000'; 
        ctx.font="40px 黑体";     
        ctx.textAlign="center";
        ctx.fillText('分数', 300, 200);
        ctx.fillText(that.score, 400, 200);
        ctx.fillText('分享给好友，一起PK吧', 350, 300);
        ctx.fillText('长按保存', 350, 500);
        var imageURL = canvas.toDataURL("image/png"); 
        var img3 = new Image();
        document.body.append(img3);
        img3.src = imageURL;
        img3.className = "save-img";
        canvas.style.display = "none";

        var closeBtn = document.createElement('div');
        closeBtn.className = "clost-btn";
        document.body.append(closeBtn);

        closeBtn.onclick = function() {
            img3.parentNode.removeChild(img3);
            closeBtn.parentNode.removeChild(closeBtn);
        }
    });

}

