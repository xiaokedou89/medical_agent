<template>
  <div class="canvas_box">
    <!-- 侧边栏 -->
    <div class="canvas_left_aside" :style="iconFlag === true ? 'margin-left: -0px;' : 'margin-left: -220px;'">
      <!-- 侧边栏编辑颜色 -->
      <el-aside class="aside_box">
        <div class="aside_box_warpper">
          <el-scrollbar id="scrollbar_box_div" wrap-class="scrollbar-wrapper">
            <div :style="{height: (information.Meshes.length + 1) * 40 + 'px'}">
              <ul id="collapse_list">
                <li @click="showModelInformation">
                  <span>{{ $t('orders.model.models') }}</span>
                </li>
                <li v-for="(item, index) in information.Meshes" :key="index" :class="itemActive === index ? 'active' : ''" @click="editDiv(item, index)">
                  <el-color-picker v-model="item.Color" show-alpha @change="changeColor(item)" />
                  <span>{{ item.label }}</span>
                </li>
              </ul>
            </div>
          </el-scrollbar>
        </div>
      </el-aside>
      <!-- 弹出缩回图标 -->
      <i :class="iconFlag?'el-icon-caret-left icon_open':'el-icon-caret-right icon_close'" @click="EventOpen()" />
    </div>

    <div class="canvas_main">
      <!-- 单个 -->
      <div class="canvas_tag" v-show="showOne" @click="onCanvasTagMouseClick($event)">
        <el-form v-if="!showSwitch" v-model="objChildren" size="small">
          <el-form-item
            prop="label"
            :label="$t('orders.model.label')"
            width="180"
          >
            {{ objChildren.label }}
          </el-form-item>
          <el-form-item
            prop="name"
            :label="$t('orders.model.name')"
            width="180"
          >
            <el-input v-model="objChildren.MeshName" :placeholder="$t('orders.model.namePlace')" />
          </el-form-item>
          <el-form-item
            prop="Describe"
            :label="$t('orders.model.describe')"
            width="180"
          >
            <el-input v-model="objChildren.Describe" type="textarea" :placeholder="$t('orders.model.describePlace')" />
          </el-form-item>
          <el-form-item
            prop="size"
            :label="$t('orders.model.size')"
            width="180"
          >
            <el-input v-model="objChildren.Size" :placeholder="$t('orders.model.sizePlace')" />
          </el-form-item>
          <el-form-item :label="$t('orders.model.label')">
            <el-select v-model="objChildren.Tags" clearable multiple filterable allow-create default-first-option :placeholder="$t('orders.model.labelPlace')" />
          </el-form-item>
          <el-form-item :label="$t('orders.model.colorAlpha')">
            <el-color-picker v-model="objChildren.Color" show-alpha @change="changeColor(objChildren)" />
          </el-form-item>
          <el-form-item>
            <el-button style="float:right; margin-top: 10px" type="primary" size="small" @click.stop="changeShow($event)"> {{ $t('confirmBtn') }}</el-button>
          </el-form-item>
        </el-form>


        <el-form v-else size="small">
          <el-form-item
            prop="light"
            :label="$t('orders.model.light')"
            width="180"
          >
            <el-input v-model="information.light" type="number" :placeholder="$t('orders.model.lightPlace')" />
          </el-form-item>
          <el-form-item
            prop="show"
            :label="$t('orders.model.descFlag')"
            width="180"
          >
            <el-switch
              v-model="information.show"
            />
          </el-form-item>
          <el-form-item
            prop="name"
            :label="$t('orders.model.name')"
            width="180"
          >
            <el-input v-model="information.name" :placeholder="$t('orders.model.namePlace')" />
          </el-form-item>
          <el-form-item
            prop="Describe"
            :label="$t('describe')"
            width="180"
          >
            <el-input v-model="information.Describe" type="textarea" :placeholder="$t('orders.model.describePlace')" />
          </el-form-item>
          <el-form-item>
            <el-button style="float:right; margin-top: 10px" type="primary" size="small" @click.stop="changeShow($event)"> {{ $t('confirmBtn') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="loading_box" v-show="loading">
        <i class="el-icon-loading" />
        <p>{{ $t('orders.model.loading') }}</p>
      </div>
      <canvas class="canvas" />
      <!-- <div class="canvas_button">
        <el-button type="primary" size="small" @click="saveInformation">{{ $t('orders.model.save') }}</el-button>
      </div> -->
    </div>
  </div>
</template>
<script>
import * as Three from 'three'
import * as status from '@/utils/status'
import OrbitControls from 'three-orbitcontrols'
import { getOrder, changeModelTag } from '@/api/Orders/orders'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import TWEEN from 'tween.js'

const informationObj = {
  name: '',
  light: 1,
  show: false,
  Describe: '',
  flag: false,
  Meshes: []
}

export default {
  name: 'Model',
  data() {
    return {
      order: null,
      id: null,
      // 用来判断是第一次进行保存还是进行编辑 true表示新增编辑
      flag: null,
      objChildren: {
        label: '',
        MeshName: '',
        Size: '',
        Tags: []
      },
      loading: true,
      // 进度百分比
      percentage: 0,
      // 模型详情
      modelDetail: null,
      // 点击显示弹框进行编辑，控制弹框的显示和隐藏
      showOne: false,
      // 排除div 点击
      divShow: false,
      // 显示模型总览还是显示子模型编辑 true为模型总览
      showSwitch: null,
      // 订单的modelTag 需要JSON解析
      information: Object.assign({}, informationObj),
      texture: '',
      modelObj: '',
      camera: null,
      mouse: null,
      scene: null,
      renderer: null,
      raycaster: null,
      // 模型
      object: null,
      // 模型父组件
      parent: null,
      // 模型中心
      center: null,
      // 控制器
      controls: null,
      // 材质基本信息
      texturePro: {},
      ambientLight: null,
      directionalLight: null,
      pointLight: null,
      // 点击获取到的模型
      intersectObj: null,
      url: status.modelUrl,
      iconFlag: true,
      itemActive: 0,
      styleObject: {
        height: 0
      }
    }
  },
  created() {
    console.log(this.$route.query)
    this.id = this.$route.query.id
    console.log(this.id)
    this.initOrder()
  },
  beforeDestroy () {
    // const canvas1 = document.getElementsByClassName('canvas')[0]
    // canvas1.removeEventListener('click', this.onDocumentMouseClick, false)
    window.removeEventListener('resize', this.onWindowResize, false)
  },
  watch: {
    modelDetail() {
      this.$nextTick(() => {
        this.init()
        this.loadModel()
        this.animate()
      })
    },
    'information.light'(newValue) {
      if (this.ambientLight != null) {
        this.ambientLight.intensity = newValue
      }
    }
  },
  methods: {
    // 根据id初始化订单
    initOrder() {
      getOrder(this.id)
        .then(res => {
          console.log(res)
          if (res.code === 20000) {
            this.order = res.data
            this.getModel()
          } else {
            this.$message({
              message: this.$t('orders.model.initOrderFail'),
              type: 'error',
              duration: 1500
            })
            this.$router.back(-1)
          }
        })
        .catch(err => {
          this.$message({
            message: this.$t('orders.model.initOrderFail'),
            type: 'error',
            duration: 1500
          })
          this.$router.back(-1)
        })
    },
    // 初始化订单后初始化模型数据
    getModel() {
      let modelDetail = JSON.parse(this.order.modelData)
      console.log(modelDetail)
      this.modelDetail = modelDetail
      if (this.order.modelTag) {
        this.information = JSON.parse(JSON.parse(this.order.modelTag).tagInfo)
      } else {
        this.information = Object.assign({}, informationObj)
      }
      if (this.information != null && this.information !== undefined) {
        if (!this.information.flag) {
          this.flag = true
          this.information = Object.assign({}, informationObj)
        } else {
          this.flag = false
        }
      } else {
        this.information = Object.assign({}, informationObj)
        this.flag = true
      }
    },
    init() {
      this.initScene()
      this.initCamera()
      this.initRenderer()
      this.initLight()
      this.initControls()
      this.initModel()
      this.initTexturePro()
    },
    LoadTexturePro(t, child) {
      if (t.disable) {
        return
      }

      if (t.emissive == '0x') {
        t.emissive = '0xffffff'
      }

      function getColor(s) {
        var c = 0x0
        try {
          if (s == '0x') {
            c = new Number('0x0')
          } else {
            c = new Number(s)
          }
        } catch (e) {
          console.log(e)
        }

        return c
        // return parseInt(s,16);
      }

      var pro = {
        color: t.color,
        specular: getColor(t.specular),
        shininess: getColor(t.shininess),
        emissive: getColor(t.emissive),
        emissiveIntensity: t.emissiveIntensity,
        bumpScale: t.bumpScale,
        normalScale: t.normalScale,
        displacementScale: t.displacementScale,
        displacementBias: t.displacementBias,
        transparent: t.transparent,
        opacity: t.opacity,
        castShadow: t.castShadow,
        receiveShadow: t.receiveShadow,
        combine: t.combine,
        reflectivity: t.reflectivity,
        clearCoat: t.clearCoat,
        clearCoatRoughness: t.clearCoatRoughness,

        refractionRatio: t.refractionRatio,
        roughness: t.roughness,
        metalness: t.metalness,
        envMapIntensity: t.envMapIntensity,
        side: t.side,
        aoMapIntensity: t.aoMapIntensity,
        // side:t.side,
        wireframe: t.wireframe,
        wireframeLinewidth: t.wireframeLinewidth,
        wireframeLinecap: t.wireframeLinecap,
        wireframeLinejoin: t.wireframeLinejoin
      }
      var m
      switch (t.type) {
        case 'MeshPhongMaterial':
          m = new Three.MeshPhongMaterial(pro)
          break
        case 'MeshPhysicalMaterial':
          m = new Three.MeshPhysicalMaterial(pro)
          break
        case 'MeshLambertMaterial':
          m = new Three.MeshLambertMaterial(pro)
          break
        default :
          m = new Three.MeshPhongMaterial(pro)
          break
      }

      child.material = m
      child.material.skinning = true
      child.castShadow = t.castShadow
      child.receiveShadow = t.receiveShadow
    },
    loadModel() {
      this.parent.remove(this.object)
      this.percentage = 0
      // 相机的位置设为初始化的位置
      this.initCamera()
      this.initControls()
      var _this = this
      function loadObjModel() {
        if (_this.flag == true) {
          _this.information.label = _this.object.name
          _this.information.Meshes = []
          for (var i = 0; i < _this.object.children.length; i++) {
            // const mesh = new meshObj()
            var meshObj = {
              label: '',
              MeshName: '',
              Size: '',
              Tags: [],
              Color: ''
            }
            meshObj.label = _this.object.children[i].name
            let material = _this.object.children[i].material.length ? _this.object.children[i].material[0] : _this.object.children[i].material
            meshObj.Color = 'rgba(' + material.color.r * 255 + ',' +
              material.color.g * 255 + ',' +
              material.color.b * 255 + ',' +
              material.opacity + ')'
            _this.information.Meshes.push(meshObj)
          }
        }
        _this.object.traverse(function(child) {
          if (_this.texture != null && _this.texture != '') {
            _this.texturePro.map = _this.texture
          }
          if (child.isMesh) {
            var c = _this.getMeshByName(child.name)
            if (c.Color && c.Color != null && c.Color != '') {
              var rgba = _this.getRgba(c.Color)
              if (rgba.length != 0) {
                _this.texturePro.color = new Three.Color(rgba[0] / 255, rgba[1] / 255, rgba[2] / 255)
                _this.texturePro.opacity = rgba[3]
              } else {
                _this.texturePro.color = child.material.color
                _this.texturePro.opacity = child.material.opacity
              }
            } else {
              _this.texturePro.color = child.material.color
              _this.texturePro.opacity = child.material.opacity
            }
            var g = child.geometry
            if (child.geometry.isBufferGeometry) {
              g = new Three.Geometry()
              g.fromBufferGeometry(child.geometry)
            }

            g.mergeVertices()
            g.computeFlatVertexNormals()
            g.computeVertexNormals()
          }

          _this.LoadTexturePro(_this.texturePro, child)
        })
        _this.parent.add(_this.object)
      }

      var manager = new Three.LoadingManager(loadObjModel)
      manager.onProgress = function(item, loaded, total) {
        console.log(item, loaded, total)
      }
      if (this.modelDetail.mapData.length != 0) {
        var textureLoader = new Three.TextureLoader(manager)
        // 腾讯云
        _this.texture = textureLoader.load(this.url + this.modelDetail.mapData[0])
      }
      function onProgress(xhr) {
        if (xhr.lengthComputable) {
          const percentComplete = xhr.loaded / xhr.total * 100
          _this.percentage = Math.round(percentComplete, 2)
          if (_this.percentage === 100) {
            // document.getElementById('canvas_center').style.display = 'none'
          }
        } else {
          //
        }
      }
      function onError(xhr) {
        console.log(xhr)
        // alert(' failed! because of error ' + xhr.target.status + ', ' + xhr.target.statusText)
        console.log('a error happen')
      }
      var loader = new FBXLoader(manager)
      loader.load((this.url + this.modelDetail.modelData), function(obj) {
        console.log('loader to load object')
        _this.object = obj
        _this.loading = false
        _this.setMesh()
      }, onProgress, onError)
    },
    animate() {
      requestAnimationFrame(this.animate)
      this.controls.update()
      this.directionalLight.position.copy(this.camera.position)
      TWEEN.update()
      this.renderer.render(this.scene, this.camera)
    },
    // 初始化场景
    initScene() {
      this.scene = new Three.Scene()
      this.mouse = new Three.Vector2()
    },
    // 初始化相机
    initCamera() {
      var canvas = document.getElementsByClassName('canvas')[0]
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      this.camera = new Three.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100000000)
      this.camera.position.z = 2000
      this.camera.lookAt(new Three.Vector3(0, 0, 0))
    },
    // 初始化渲染器
    initRenderer() {
      const canvas1 = document.getElementsByClassName('canvas')[0]
      this.renderer = new Three.WebGLRenderer({
        canvas: canvas1,
        antialias: true,
        autoClear: true,
        logarithmicDepthBuffer: true
      })
      const gl = canvas1.getContext('webgl2')
      gl.enable(gl.CULL_FACE)
      gl.cullFace(gl.BACK)
      this.renderer.physicallyCorrectLights = true
      this.renderer.shadowMapEnabled = true
      this.renderer.shadowMap.type = 2
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setSize(canvas1.clientWidth, canvas1.clientHeight)
      // canvas1.addEventListener('click', this.onDocumentMouseClick, false)
      window.addEventListener('resize', this.onWindowResize, false)
    },
    // 初始化灯光
    initLight() {
      if (this.flag) {
        this.ambientLight = new Three.AmbientLight(0xAFAFAF, 1)
      } else {
        this.ambientLight = new Three.AmbientLight(0xAFAFAF, this.information.light)
      }
      this.ambientLight.name = 'AmbientLight '
      this.scene.add(this.ambientLight)
      this.directionalLight = new Three.DirectionalLight(0xffffff, 2)
      this.directionalLight.name = '_bindCamera'
      this.directionalLight.position.set(0, 10000, 0)
      this.directionalLight.lookAt(new Three.Vector3(0, 0, 0))
      this.scene.add(this.directionalLight)
    },
    // 初始化控制器
    initControls() {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      // 使动画循环使用时阻尼或自转 意思是否有惯性
      this.controls.enableDamping = true
      // 动态阻尼系数 就是鼠标拖拽旋转灵敏度
      this.controls.dampingFactor = 0.25
      // 是否可以缩放
      this.controls.enableZoom = true
      // 是否自动旋转
      this.controls.autoRotate = false
      // // 设置相机距离原点的最远距离
      // this.controls.minDistance = 200
      // // 设置相机距离原点的最远距离
      // this.controls.maxDistance = 300
      // 是否开启右键拖拽
      this.controls.enablePan = true
    },
    initModel() {
      // 如果模型列表中只显示只有一个。上个模型和下个模型隐藏
      this.parent = new Three.Group()
      this.scene.add(this.parent)
    },
    initTexturePro() {
      // 是否废掉
      this.texturePro.disable = false
      this.texturePro.polygonOffset = true
      this.texturePro.polygonOffsetFactor = 0.75
      this.texturePro.polygonOffsetUnits = 4.0
      this.texturePro.new = 'new'
      this.texturePro.old = 'old'

      this.texturePro.type = 'MeshPhongMaterial'
      this.texturePro.map = {}// 基本贴图
      this.texturePro.depthTest = false
      this.texturePro.depthWrite = false
      this.texturePro.aoMap = {}
      this.texturePro.aoMapIntensity = 1// ao强度

      this.texturePro.specular = '0x111111'// 镜面颜色
      this.texturePro.specularMap = {}
      this.texturePro.shininess = 30// 镜面反射强度

      this.texturePro.emissive = '0xffffff'// 高光颜色
      this.texturePro.emissiveMap = {}// 高光贴图
      this.texturePro.emissiveIntensity = 0// 高光轻度

      this.texturePro.bumpMap = {}// 凹凸贴图
      this.texturePro.bumpScale = 1// 凹凸高度/深度

      this.texturePro.normalMap = {}// 法向贴图
      this.texturePro.normalScale = new Three.Vector2(1, 1)// 法向深度

      this.texturePro.displacementMap = {}// 位移贴图
      this.texturePro.displacementScale = 1// 位移值
      this.texturePro.displacementBias = 0// 位移偏差

      this.texturePro.alphaMap = {}// 透明贴图

      this.texturePro.transparent = true// 是否透明
      this.texturePro.opacity = 1// 透明度

      // 灯光贴图
      this.texturePro.lightMap = {}
      this.texturePro.lightMapIntensity = 1// 灯光贴图强度强度

      this.texturePro.castShadow = false
      this.texturePro.receiveShadow = false

      this.texturePro.envMap = {}// 环境贴图
      this.texturePro.envMapShowType = 1
      this.texturePro.envMapOn = false
      this.texturePro.envMapOn2 = false

      this.texturePro.combine = Three.MultiplyOperation// 组合
      // Options are MultiplyOperation (default), MixOperation, AddOperation. If mix is chosen, the reflectivity is used to blend between the two colors.
      this.texturePro.envMapTypeSet = 0// 反射
      this.texturePro.reflectivity = 1// 反射率
      this.texturePro.refractionRatio = 0.98// 折射率

      this.texturePro.side = Three.FrontSide// 渲染面
      this.texturePro.wireframe = false
      this.texturePro.wireframeLinewidth = 1
      this.texturePro.wireframeLinecap = 'round1'// butt", d"round" and "square
      this.texturePro.wireframeLinejoin = 'round2'// d round", "bevel" and "miter"
      this.texturePro.mapping = Three.EquirectangularReflectionMapping
      this.texturePro.magFilter = Three.LinearFilter
      this.texturePro.minFilter = Three.LinearFilter
    },
    // =================  添加的事件类 =================
    onDocumentMouseClick(event) {
      const mainCanvas = document.getElementsByClassName('canvas')[0]
      this.mouse.x = ((event.clientX - mainCanvas.getBoundingClientRect().left) / mainCanvas.offsetWidth) * 2 - 1// 标准设备横坐标
      this.mouse.y = -((event.clientY - mainCanvas.getBoundingClientRect().top) / mainCanvas.offsetHeight) * 2 + 1// 标准设备纵坐标
      var vector = new Three.Vector3(this.mouse.x, this.mouse.y, 0.5).unproject(this.camera)
      this.raycaster = new Three.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize())
      this.raycaster.setFromCamera(this.mouse, this.camera)
      const intersects = this.raycaster.intersectObjects(this.scene.children, true)
      // 如果获取到点击对象
      if (intersects.length > 0) {
        this.showSwitch = false
        this.intersectObj = intersects[0].object
        this.showOne = true
        this.objChildren = this.getMeshByName(this.intersectObj.name)
      } else if (this.divShow) {
        this.showOne = true
      } else {
        this.showOne = false
      }
    },
    onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()

      this.renderer.setSize(window.innerWidth, window.innerHeight)
    },
    // 点击保存按钮
    saveInformation() {
      if (this.information.name == '' && this.information.light == 1 && this.information.Describe == '' && this.Meshes == []) {
        this.information.flag = false
      } else {
        this.information.flag = true
      }
      const data = {
        tagInfo: JSON.stringify(this.information)
      }
      changeModelTag(this.id, data)
        .then(res => {
          if (res.code === 20000) {
            this.$message({
              message: this.$t('orders.model.saveSuc'),
              type: 'success',
              duration: 1500
            })
          } else {
            this.$message({
              message: this.$t('orders.model.saveFail'),
              type: 'error',
              duration: 1500
            })
          }
        })
        .catch(err => {
          this.$message({
            message: err,
            type: 'error',
            duration: 1500
          })
        })
    },
    // ================= 工具类 =================
    getMeshByName(label) {
      for (var i = 0; i < this.information.Meshes.length; i++) {
        this.itemActive = i
        if (label == this.information.Meshes[i].label) {
          return this.information.Meshes[i]
        }
      }
    },
    getRgba(rgba) {
      return rgba.match(/(\d(\.\d+)?)+/g)
    },
    setMesh() {
      const _this = this
      // 将模型设置于中心位置
      const box = new Three.Box3().setFromObject(_this.object)
      _this.center = box.getCenter()
      _this.object.position.x = 0 - _this.center.x
      _this.object.position.y = 0 - _this.center.y
      _this.object.position.z = 0 - _this.center.z
      var c = _this.camera
      var min = c.min ? c.min : 4
      var max = c.max ? c.max : 4

      var tsize = box.getSize()
      var val = tsize.y

      if (val < tsize.x) {
        val = tsize.x
      }
      if (val < tsize.z) {
        val = tsize.z
      }

      var x = _this.camera.position.x
      var y = _this.camera.position.y
      var z = val / (2 * Math.tan(_this.camera.fov * Math.PI / 360)) * 2
      var v = new Three.Vector3(x, y, z)

      _this.controls.minDistance = v.z / min
      _this.camera.min = min
      _this.controls.maxDistance = v.z * max
      _this.camera.max = max
      c.position.x = v.x
      c.position.y = v.y
      var valMax = Math.max(Math.max(tsize.y, tsize.x), tsize.z)
      if (valMax < v.z) { c.position.z = v.z } else { c.position.z = valMax }
    },
    changeAnnoattion(position) {
      var _this = this
      var tween1 = new TWEEN.Tween(this.camera.position).to({
        x: position.x,
        y: position.y,
        z: position.z
      }, 1000).onUpdate(function() {
        // _this.camera.lookAt(new Three.Vector3(0, 0, 0))
      }).onComplete(function() {}).start()
    },
    // ================= 事件类 =================
    //点击模型总览弹出框
    showModelInformation() {
      this.divShow = true
      this.showSwitch = true
    },
    // 点击侧边栏中的一项
    editDiv(item, index) {
      this.itemActive = index
      this.showSwitch = false
      this.divShow = true
      this.objChildren = item
      if (this.object != null) {
        for (var i = 0; i < this.object.children.length; i++) {
          if (this.object.children[i].name == item.label) {
            this.intersectObj = this.object.children[i]
            this.intersectObj.geometry.computeBoundingBox()
          }
        }
      }
    },
    // 侧边栏项改变颜色
    changeColor(item) {
      var rgb = this.getRgba(item.Color)
      this.intersectObj = this.object.getObjectByName(item.label)
      this.intersectObj.material.color.r = rgb[0] / 255
      this.intersectObj.material.color.g = rgb[1] / 255
      this.intersectObj.material.color.b = rgb[2] / 255
      this.intersectObj.material.opacity = rgb[3]
      for (var i = 0; i < this.object.children.length; i++) {
        if (this.object.children[i].material.opacity < 1) {
          this.object.children[i].material.transparent = true
          this.object.children[i].material.depthWrite = false
        } else {
          this.object.children[i].material.transparent = false
          this.object.children[i].material.depthWrite = true
        }
      }
       var centroid = new Three.Vector3()
      centroid.addVectors(this.intersectObj.geometry.boundingBox.min, this.intersectObj.geometry.boundingBox.max)
      centroid.multiplyScalar(0.5)

      centroid.applyMatrix4(this.intersectObj.matrixWorld)

      this.changeAnnoattion(centroid)
    },
    changeShow(e) {
      e.preventDefault()
      this.showSwitch = null
      this.divShow = false
      this.showOne = false
    },
    // 点击侧边栏隐藏显示
    EventOpen() {
      this.iconFlag = !this.iconFlag
    },
    // 弹出框点击事件
    onCanvasTagMouseClick(e) {
      e.preventDefault()
      this.showOne = true
      this.divShow = true
    }
  }
}
</script>
<style lang="scss" >
#scrollbar_box_div {
  height:100%;
  overflow-x:hidden;
}
.el-scrollbar__wrap{
  overflow-x:hidden !important
}
.canvas_box{
  border: 1px solid #bdbdbd;
  overflow: hidden;
  display:flex;
  height:100%

}
.canvas_left_aside{
  flex:0 0 auto;
  position: relative;
}
.canvas_left_aside,.el-aside{
  width:220px;
  height:calc(100vh - 50px);
  // height: 100vh;
  background: #3c3c3c;
  color: #e8e8e8;
}
.canvas_left_aside .el-icon-caret-left.icon_open,.canvas_left_aside .el-icon-caret-right.icon_close{
  font-size: 20px;
  position: absolute;
  right: -20px;
  z-index: 999;
  border: 1px solid #716d6d;
  top: 50%;
  background: #3c3c3c;
  color: #fff;
  padding: 10px 0px 10px 0;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  border-left:transparent
}
.aside_box{
  width:220px !important;
}
.aside_box_warpper{
  height:100%
}
.canvas_main{
  flex:1 1 auto;
  width:100%;
  overflow: hidden;
  height:calc(100vh - 50px);
  // height: 100vh;
  position:relative;
  display:block;
  margin: 0;
}
.canvas_tag{
  background: #3c3c3c5c;
  position: absolute;
  z-index: 1;
  width: 220px;
  padding: 10px;
  border: 1px solid #777171;
  border-radius: 10px;
  right:0;
  top:60px;
  color:#fff;
}
.list_box{
  padding:10px;

}
#collapse_list{
  list-style: none;
  padding:0
}
#collapse_list li{
  padding:0 10px;
  font-size:14px;
  line-height: 40px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
#collapse_list li:hover{
  color:#ffd401
}
#collapse_list li.active,#collapse_list li:active{
  color: #ffd401;
  border-left: 2px solid #ffd401;
}
#collapse_list .el-collapse-item__content{
  padding-bottom:0px;
}

#collapse_list .el-collapse-item__content .el-form> .el-form-item--small.el-form-item,
.canvas_tag .el-form> .el-form-item--small.el-form-item {
  margin-bottom:0
}
.el-collapse-item__header{
  padding-left:10px;
}
.canvas_tag .el-form .el-form-item--small.el-form-item >.el-form-item__label{
  color:#ffba3c;
}
.canvas_tag .el-form .el-form-item--small.el-form-item .el-form-item__content .el-input.el-input--small >.el-input__inner,
.canvas_tag .el-form .el-form-item--small.el-form-item .el-form-item__content .el-textarea.el-input--small > .el-textarea__inner{
  background: transparent;
  border:1px solid #ffba3c;
  color: #fff;
}

.canvas{
  display: block;
  outline: none;
}
.canvas_button{
  position:absolute; right:10px; top:10px; z-index:1001;width:60px
}
#canvas_center{
  position: absolute;z-index: 1000;top:50%;left:50%;
}
</style>

<style scoped>
.app-main{
  min-height: 100vh;
  height: 100Vh;
}
.el-select__input{
  color:#fff
}
@media screen and (width: 1920px) {
  .canvas{
    min-height: 650px;
  }
}
.loading_box{
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-25px,-50%);
  color: #409eff;

}
.loading_box .el-icon-loading{
  font-size: 50px;
}

</style>
