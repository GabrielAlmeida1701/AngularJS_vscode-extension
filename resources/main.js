// @ts-nocheck

(function () {
    //#region GLOBAL
    const vscode = acquireVsCodeApi();

    var SCREEN_WIDTH  = window.innerWidth - 40;
    var SCREEN_HEIGHT = window.innerHeight - 40;
    var RATIO = ((SCREEN_WIDTH + SCREEN_HEIGHT) / 3000) * 1;
    
    const WORLD_MATRIX = { x: 0, y: 0 }
    const GRAVITY = 10
    const PhysicsEntity = { STATIC: 0, DYNAMIC: 1 }

    var Context2D = null;
    var elements = []
    var keysPressed = []

    const isPressed = (key) => !isEmpty(keysPressed.find(x => x.key == key))
    const isEmpty = (val) => val === undefined || val === null
    const loadImage = (src) => {
        return new Promise(resolve => {
            let elem = document.getElementById(src)
            resolve(elem)
        })
    };
    //#endregion
    
    //#region Base classes
    class JsAnimation {
        /**
         * (Optional)  
         * **Count**: The total count of frames  
         * **Speed**: The speed of each frame (in ticks per second)  
         * **Size**: The size of each frame in pixels  
         * @param {string} sprite
         * @param {{ count: any; speed: any; size: any; }} config
         */
        constructor(sprite, config) {
            //let self = this
            /** @type {HTMLImageElement} */
            this.sprite = null
            /** @type {string} */
            this.animationName = ''
    
            /**
             * @type {{
             *    frame: number,
             *    frameCount: number,
             *    ticks: number,
             *    ticksInFrame: number,
             *    frameSize: number
             * }} animConfig 
             * */
            var animConfig = undefined
    
            /**
             * **Count**: The total count of frames  
             * **Speed**: The speed of each frame (in ticks per second)  
             * **Size**: The size of each frame in pixels  
             * @param {{ count: any; speed: any; size: any; }} config
             */
            this.setConfig = (config) => {
                animConfig = {
                    frame: 0, frameCount: config.count,
                    ticks: 0, ticksInFrame: config.speed,
                    frameSize: config.size
                }
            }
    
            /**
             * @param {string} src
             */
            this.setSprite = async (src) => {
                this.sprite = await loadImage(src)
                this.animationName = src
            }
    
            this.setSprite(sprite);
            if(!isEmpty(config)) this.setConfig(config)
    
            this.update = () => {
                if(isEmpty(animConfig)) throw Error('No config')
                if(animConfig.ticks > animConfig.ticksInFrame) {
                    animConfig.ticks = 0;
                    animConfig.frame += rewind? 1 : -1;
    
                    if(animConfig.frame >= animConfig.frameCount)
                        animConfig.frame = 0
                    if(animConfig.frame < 0) animConfig.frame = animConfig.frameCount-1
                }
                animConfig.ticks++;
                
                return {
                    dx: animConfig.frame * animConfig.frameSize,
                    dy: 0,
                    sx: animConfig.frameSize,
                    sy: animConfig.frameSize
                }
            }
        }
    }

    class JsElement {
        /**
         * @param {string} name
         * @param {string} tag
         * */
        constructor(name, tag) {
            //let self = this
            this.name = name
            this.tag = isEmpty(tag)? 'object' : tag
            this.physicalType = PhysicsEntity.DYNAMIC
    
            var useSprite = false
            var useAnimation = false
    
            /** @type {Array<JsAnimation>} */
            var animations = []
            /** @type {JsAnimation} */
            var crrAnim
    
            this.rect = { x: 0, y: 0, w: 20, h: 20 }
            this.color = '#fff'
            this.sprite = null
    
            /** @type {{ dx: number, dy: number, sx: number, sy: number }} */
            this.uv = undefined
    
            this.start = () => {}
            this.update = () => {
                if(isPressed('d')) this.rect.x += 5
            }
    
            this.render = () => {
                var {x,y,w,h} = this.rect
                x = (x + WORLD_MATRIX.x) * RATIO
                y = (y + WORLD_MATRIX.y) * RATIO
                w *= RATIO
                h *= RATIO
    
                if(!useSprite && !useAnimation) {
                    Context2D.beginPath()
                    Context2D.rect(x, y, w, h)
                    Context2D.fillStyle = this.color
                    Context2D.fill();
    
                } else {
                    if(isEmpty(this.uv) && !useAnimation) Context2D.drawImage( this.sprite, x, y, w, h )
                    else {
                        let {dx,dy,sx,sy} = useAnimation? crrAnim.update() : this.uv
                        let sprite = useAnimation? crrAnim.sprite : this.sprite
                        
                        Context2D.drawImage(sprite, dx, dy, sx, sy, x, y, w, h)
                    }
                }
            }
    
            this.setSprite = async (src, uv) => {
                if(!isEmpty(uv)) this.uv = uv
                this.sprite = await loadImage(src)
                useSprite = true
                useAnimation = false
            }
    
            /**
             * @param {Array<JsAnimation>} anims
             */
            this.setAnimations = (anims) => animations = anims
    
            /**
             * @param {string} anim
             */
            this.playAnimation = (anim) => {
                let select = animations.find(x => x.animationName == anim)
                if(!isEmpty(select)) {
                    crrAnim = select
                    useAnimation = true;
                }
            }
    
            /**
             * @param {JsElement} elem
             */
            this.onCollision = (elem) => {}
            this.onRender = () => {}
        }
    }

    class TileMap {
        constructor() {
            //let self = this
            var tileType = 'tilemap'
            /** @type {Array<JsElement>} */
            var mapsheet = []
    
            /** @type {number} */
            var tileSize = 8
    
            /** @type {{ x: number, y: number, w: number, h: number }} */
            this.rect = { x:0, y:0, w: 8, h: 8 }
    
            /** @type {HTMLImageElement} */
            this.sprite = null
    
            /**
             * @param {{
             *     spriteSheet: string,
             *     tileMap: Array<Array<number>>,
             *     rect: { x: number, y: number, w: number, h: number },
             *     tileSize: number
             * }} tileSettings 
             * */
            this.createTileMap = (tileSettings) => {
                if(isEmpty(tileSettings)) throw Error('No Tile Settings given')
    
                if(!isEmpty(tileSettings.rect)) this.rect = tileSettings.rect
                if(!isEmpty(tileSettings.tileSize)) tileSize = tileSettings.tileSize
                if(!isEmpty(tileSettings.spriteSheet)) tileType = tileSettings.spriteSheet
                this.setSprite(tileType)
    
                if(!isEmpty(tileSettings.tileMap)) {
                    let map = tileSettings.tileMap, len = -1
                    map.forEach(row => {
                        if(len == -1) len = row.length
                        if(len != row.length) throw Error('Tile map is misshapen')
                    })
    
                    let {x, y, w, h} = this.rect
                    map.forEach(row => {
                        row.forEach(tile => {
                            if(tile != 0) {
                                let dx = (tile-1) * tileSize
                                let elem = new JsElement(`tile${x}x${y}|${tile}`, 'tile')
                                elem.rect = { x, y, w, h }
                                elem.uv = { dx, dy: 0, sx: 8, sy: 8 }
                                elem.setSprite(tileType)
                                mapsheet.push(elem)
                            }
    
                            x += w
                        })
        
                        y += h
                        x = this.rect.x
                    })
                }
            }
    
            this.render = () => {
                if(isEmpty(mapsheet) || isEmpty(this.sprite)) return
                mapsheet.forEach(elem => elem.render())
            }
    
            this.solvePhysics = () => {
                if(mapsheet === null) return
                elements.forEach(elem => {
                    mapsheet.forEach(tile => Physics.calcCollisions(elem, tile))
                })
            }
    
            this.setSprite = async (src) => {
                this.sprite = await loadImage(src)
                tileType = src
            }
        }
    }
    //#endregion

    //#region Physics
    /**
     * @param {JsElement} coll
     * @param {JsElement} other
     */
    const isColliding = (coll, other) => {
        let cRect = coll.rect
        let oRect = other.rect

        //Collider edges
        let l1 = cRect.x,
            t1 = cRect.y,
            r1 = cRect.x + cRect.w,
            b1 = cRect.y + cRect.h

        //Collidee edges
        let l2 = oRect.x,
            t2 = oRect.y,
            r2 = oRect.x + oRect.w,
            b2 = oRect.y + oRect.h
        
        // If the any of the edges are beyond any of the
        // others, then we know that the box cannot be colliding
        return !(b1 < t2 || t1 > b2 || r1 < l2 || l1 > r2)
    }
    const findCollision = (collider, collidee) => {
        if(!isEmpty(collidee)) {
            let aux = Physics.collisions.findIndex(x => x.collider == collider && x.collidee == collidee)
            return aux != -1? aux : undefined
        } else return Physics.collisions.findIndex(x => x.collider == collider || x.collidee == collider)
    }
    const Physics = {

        /** @type {Array<{collider:JsElement, collidee:JsElement}>} */
        collisions: [],
        addCollision: (collider, collidee) => {
            //if needed: onCollisionEnter goes here
            if(isEmpty(findCollision(collider, collidee))) Physics.collisions.push({collider, collidee})
        },
        removeCollision: (collider, collidee) => {
            let aux = findCollision(collider, collidee)
            if(!isEmpty(aux)) Physics.collisions.splice(aux, 1)
        },
        removeCollRef: (collider) => {
            let aux = findCollision(collider)
            while(aux != -1) {
                Physics.collisions.splice(aux, 1)
                aux = findCollision(collider)
            }
        },

        /**
         * @param {JsElement} collider
         * @param {JsElement} collidee
         */
        calcCollisions: (collider, collidee) => {
            let solved = Physics.solve(collider, collidee)

            if(solved == 1) {
                collider.onCollision(collidee)
                collidee.onCollision(collider)
            } else if(solved == 0) {
                //if needed: onCollisionExit goes here
                Physics.removeCollision(collider, collidee)
            }
        },
        apply: (collider) => {
            let aux = findCollision(collider)
            if(aux == -1 && collider.physicalType !== PhysicsEntity.STATIC) collider.rect.y += GRAVITY
        },

        /**
         * @param {JsElement} collider
         * @param {JsElement} collidee
         */
        solve: (collider, collidee) => {
            if(isEmpty(collider) || isEmpty(collidee)|| collider == collidee) return -1
            if(!isColliding(collider, collidee) ) return 0

            let cRect = collider.rect
            let oRect = collidee.rect
        
            let mid1 = {
                x: (cRect.w / 2) + cRect.x,
                y: (cRect.h / 2) + cRect.y
            }
            let mid2 = {
                x: (oRect.w / 2) + oRect.x,
                y: (oRect.h / 2) + oRect.y
            }
        
            let dx = (mid2.x - mid1.x) / (oRect.w / 2),
                dy = (mid2.y - mid1.y) / (oRect.h / 2)
        
            let absDX = Math.abs(dx),
                absDY = Math.abs(dy)
        
            if (Math.abs(absDX - absDY) < .1 || absDX > absDY) {
                if (dx < 0) cRect.x = oRect.x + oRect.w
                else cRect.x = oRect.x - cRect.w
        
                if (dy < 0 && cRect.y > mid2.y) cRect.y = oRect.y + oRect.h
                else if((cRect.y + cRect.h) - oRect.y < 5) cRect.y = oRect.y - cRect.h
            } else {

                // If the player is approaching from positive Y
                if (dy < 0) cRect.y = oRect.y + oRect.h
                else cRect.y = oRect.y - cRect.h
            }

            Physics.addCollision(collider, collidee)
            return 1
        }
    }
    //#endregion

    //#region Elements
    class Player {
        constructor() {
            //let self = this
            this.elem = new JsElement('player')
            this.elem.tag = 'player'
            this.elem.physicalType = PhysicsEntity.DYNAMIC
    
            var rect = this.elem.rect = { x: 105, y: SCREEN_HEIGHT - 300, w: 25, h: 50 }
            var onAir = false
            var airTime = 20
    
            this.elem.start = () => {
                this.elem.setSprite('player')
            }
    
            this.elem.update = () => {
                if(isPressed('d')) rect.x += 5
                else if(isPressed('a')) rect.x -= 5
                else if(isPressed('s') && !onAir) rect.y++
    
                if(!onAir && isPressed('space')) {
                    onAir = true
                    rect.y -= 5
                } else if(onAir) {
                    this.elem.physicalType = PhysicsEntity.STATIC
    
                    rect.y -= airTime
                    airTime--
                    if(airTime < -20) airTime = -20
                }
    
                if(rect.y * RATIO > SCREEN_HEIGHT * 2) gameOver()
            }
    
            this.elem.onRender = () => {
                if(rect.x > SCREEN_WIDTH / 2) WORLD_MATRIX.x = -rect.x + (SCREEN_WIDTH / 2)
            }
    
            this.elem.onCollision = (elem) => {
                if(elem.name == 'coin') deleteObject(elem)
                if(elem.tag == 'tile') {
                    onAir = false;
                    airTime = 20
                    this.elem.physicalType = PhysicsEntity.DYNAMIC
                }
            }
        }
    }
    //#endregion

    //#region Main
    // @ts-ignore
    const canvas = document.getElementById('draw-area');
    canvas.setAttribute('width', SCREEN_WIDTH)
    canvas.setAttribute('height', SCREEN_HEIGHT)
    var ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false
    
    var tileMap = new TileMap()
    tileMap.createTileMap({
        rect: { x: 50, y: SCREEN_HEIGHT - 450, w: 50, h: 50 },
        tileSize: 8,
        tileMap: [
            [1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],
            [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0],
            [3,3,3,3,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,0]
        ]
    })

    var player = new Player()
    elements.push(player.elem)

    ctx.beginPath()
    ctx.rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)
    ctx.fillStyle = '#1d1d1d'
    ctx.fill();
    
    Context2D = ctx
    var running = true
    const update = () => {
        SCREEN_WIDTH  = window.innerWidth - 40;
        SCREEN_HEIGHT = window.innerHeight - 40;
        RATIO = ((SCREEN_WIDTH + SCREEN_HEIGHT) / 3000) * 1;

        Physics.apply(player.elem)

        elements.forEach(elem => {
            elem.update();
            Physics.calcCollisions(elements[0], elem)
        })
        tileMap.solvePhysics()

        ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)

        tileMap.render()
        elements.forEach(elem => elem.render())

        if(running) setTimeout(() => update(), 30)
    }

    console.log(vscode)
    setTimeout(() => update(), 30)

    /** @param {KeyboardEvent} event */
    document.onkeydown = (event) => {
        let code = event.which || event.keyCode
        let key = code == 32? 'space' : event.key
        if(!isPressed(key)) keysPressed.push({ code, key })
        
        if(code == 27) inLoop = false //quit game
    }

    /** @param {KeyboardEvent} event */
    document.onkeyup = (event) => {
        let key = event.which || event.keyCode
        let id = keysPressed.findIndex(x => x.code == key)
        keysPressed.splice(id, 1)
    }

    window.addEventListener('message', event => {
        const message = event.data;
        if(message.dispose) running = false
    })
    //#endregion
}());