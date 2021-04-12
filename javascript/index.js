const NUM_PERSONAJES = 10
const LENGTH_CONDITION = 4
const RANGE_DATA_API = 200

class Juego {
    constructor() {
        this.generarIdRandom()
        this.container = document.getElementById("game")
        this.containerCargando = document.getElementById("cargando")
        this.intentosDiv = document.getElementById('movimientos')
        this.containerTiempo = document.getElementById('tiempo')

        this.trieds = new Array(LENGTH_CONDITION)
        this.targets = []
        this.targetsWell = []
        this.dataImg = []
        this.s = this.h = this.m = this.time = 0
        this.pausa = 0
        this.bool = true
        this.intentos = this.movimiento = 0
        this.firstMov = true
        this.dataAPI = {
            loading: true,
            data: {
                info: {},
                results: []
            }
        }
    }
    generarIdRandom() {
        this.matriz = new Array(NUM_PERSONAJES).fill(0).map(() => +(Math.random() * (RANGE_DATA_API - 1) + 1).toFixed(0))
        this.matriz = this.matriz.concat(this.matriz)
        this.matriz = this.matriz.sort(() => Math.random() - 0.5);
    }
    fetchData = async () => {
        try {
            for (let i = 1; i <= RANGE_DATA_API; i++) {
                let response = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}/`)
                let data = await response.json()
                //with file svg
                //this.dataImg.push(data.sprites.other.dream_world.front_default)
                //with file jpg
                this.dataImg.push(data.sprites.front_shiny)
            }
            this.dataAPI = {
                complete: true,
                error: true,
                data: this.dataImg
            }

        } catch (error) {
            this.dataAPI = { complete: true, error: error }
            console.log('error api -> ', this.dataAPI.error)
        }
    }
    async crearDiv() {
        await this.fetchData()
        this.seleccion = this.seleccion.bind(this)

        for (let i = 0; i < this.matriz.length; i++) {
            this.targets[i] = document.createElement('div')
            this.targets[i].classList.add('item')
            this.targets[i].innerText = i
            this.targets[i].setAttribute('data-position', i)
            this.targets[i].innerHTML =
                '<div class="front vueltaFront" data-position="' +
                i +
                '"></div><div class="back vueltaBack" data-position="' +
                i +
                '" style="background-image: url(' + this.dataAPI.data[this.matriz[i]] + ');">' + '' + '</div>'

            this.container.appendChild(this.targets[i])
            this.addEventListen(i)
        }
        this.containerCargando.style.display = 'none'
        this.container.style.display = 'flex'
    }
    addEventListen(index) {
        this.targets[index].addEventListener('click', this.seleccion)
    }
    removeEventListen(index) {
        this.targets[index].removeEventListener('click', this.seleccion)
    }
    seleccion(ev) {
        this.indice = ev.target.dataset.position
        this.evaluarJuego()
    }
    evaluarJuego() {
        if (this.firstMov) setInterval('ejecutar.tiempo()', 1000)
        this.firstMov = false
        if (this.bool) {
            this.trieds[0] = this.matriz[this.indice]
            this.trieds[2] = this.indice
            this.targets[this.indice].classList.add('rotar')
            this.removeEventListen(this.trieds[2])
            this.bool = false
            this.mostrarIntentos()
        } else {
            this.trieds[1] = this.matriz[this.indice]
            this.trieds[3] = this.indice
            this.targets[this.indice].classList.add('rotar')
            this.removeEventListen(this.trieds[3])
            this.bool = true
            this.mostrarIntentos()
            if (this.trieds[0] == this.trieds[1]) {
                this.targetsWell.push(this.trieds[2])
                this.targetsWell.push(this.trieds[3])
                this.removeEventListen(this.trieds[2])
                this.removeEventListen(this.trieds[3])
                if (this.targetsWell.length >= NUM_PERSONAJES * 2) {
                    this.pausarTiempo()
                    swal(
                        'You Win!',
                        `Actions: ${this.intentos} \n
                        Time: ${this.m}:${this.s}`,
                        'success'
                    ).then(() => {
                        console.log('hola')
                    })
                    console.log('ya!')
                }
            } else {
                this.targets.forEach((value, index) => {
                    this.removeEventListen(index)
                })
                this.wait(function () {
                    this.targets.forEach((value, index) => {
                        if (this.targetsWell.includes(index.toString())) {
                        } else {
                            this.addEventListen(index)
                        }
                    })
                })
            }
        }
    }
    wait(callback) {
        setTimeout(() => {
            this.targets[this.trieds[2]].classList.remove('rotar')
            this.targets[this.trieds[3]].classList.remove('rotar')
            callback = callback.bind(this)
            callback()
        }, 1500);
    }
    mostrarIntentos() {
        this.intentos++
        this.intentosDiv.innerText = `Actions: ${this.intentos}`
    }
    tiempo() {
        if (!this.pausa) {
            this.s++;
            if (this.s > 59) { this.m++; this.s = 0; }
            if (this.m > 59) { this.m = 0; }
            if (this.m < 1) {
                this.m = '00'
            }
            this.containerTiempo.innerText = `${this.m}:${this.s}`
        }
    }
    pausarTiempo() {
        this.pausa = 1
    }
    juegoNuevo() {
        location.reload()
    }
}
function init() {
    const ejecutar = new Juego()
    ejecutar.crearDiv()
}
init()