<template>
<div class="add-category">
    <el-card class="container">
      <el-form ref="addForm" :model="addGoodsObj" :rules="rules" size="small" label-width="80px">
        <el-form-item :label="$t('name') + '：'" prop="name">
          <el-input v-model.trim="addGoodsObj.name" style="width: 60%" />
        </el-form-item>
        <el-form-item :label="$t('description') + '：'" prop="introduce">
          <el-input
            v-model.trim="addGoodsObj.introduce"
            maxlength="100"
            rows="5"
            show-word-limit
            type="textarea"
            style="width: 60%"
          />
        </el-form-item>
        <el-form-item :label="$t('category') + '：'" prop="category.id">
          <el-select v-model="addGoodsObj.category.id" :placeholder="$t('rules.goodsCategory')" size="small" @change="selectChange">
            <el-option
              v-for="item in categoryList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('image') + '：'" prop="photo">
          <el-input v-model.trim="addGoodsObj.photo" style="width: 60%" />
        </el-form-item>
        <el-form-item :label="$t('status') + '：'" prop="status">
          <el-tooltip effect="dark" placement="top" :content="getStatus(addGoodsObj.status)">
            <el-switch
              v-model="addGoodsObj.status"
              :active-value="1"
              :inactive-value="0"
            />
          </el-tooltip>
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" @click="handleAddGoods">{{$t('confirmBtn')}}</el-button>
          <el-button size="small" @click="backToAddGoods">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
</div>
</template>
<script>
import * as rule from '@/utils/rules'
import * as api from '@/api/Goods/goods.js'
import * as status from '@/utils/status'
const rules = {
    goodsNo: rule.rolenameRules,
    name: rule.rolenameRules,
    photo: rule.areaRules,
    "category.id": rule.areaRules
}

export default {
  name: 'NewGood',
  data() {
    return {
      // 商品分类列表
      categoryList: [],
      rules,
      addGoodsObj: {
          id: null,
          name: '',
          introduce: '',
          status: 0,
          photo: '',
          category: {
            id: null,
            name: '',
            description: '',
            sort: 0
          }
      }
    }
  },
  created() {
    this.initCategoryList()
  },
  computed: {
    // 根据状态回显文字
    getStatus() {
      return status.goodStatus
    }
  },
  methods: {
    // 初始化商品分类列表
    initCategoryList() {
      api.getAllGoodsCategory()
      .then(res => {
        if (res.code === 20000) {
          this.categoryList = res.data
        }
      })
      .catch(err => {
        this.$message({
          message: this.$t('goods.newGoods.initCategoryFail'),
          type: 'error',
          duration: 1500
        })
      })
    },
    // 分类下拉选择值改变事件
    selectChange(e) {
      this.addGoodsObj.category.name = this.getItem(e).name
      this.addGoodsObj.category.description = this.getItem(e).description
      this.addGoodsObj.category.sort = this.getItem(e).sort
      console.log(this.getItem(e))
      console.log(this.addGoodsObj.category)
    },
    // 根据分类下拉框选中值获取索引值
    getItem(id) {
      for (let [index, item] of this.categoryList.entries()) {
        if (item.id === id) {
          return item
        }
      }
    },
    // 点击确定事件
    handleAddGoods() {
      this.$refs.addForm.validate(valid => {
        if (valid) {
          console.log(this.addGoodsObj)
          api.addGoods(this.addGoodsObj)
            .then(res => {
              console.log(res)
              if (res.code === 20000) {
                this.$message({
                  message: this.$t('addSucMes'),
                  type: 'success',
                  duration: 1500
                })
                this.$router.push('/goods/addgoods')
              }
            })
            .catch(err => {
              this.$message({
                message: err,
                type: 'error',
                duration: 1500
              })
            })
        } else {
          this.$message({
            message: this.$t('validFailMes'),
            type: 'error',
            duration: 1500
          })
        }
      })
    },
    // 点击取消事件
    backToAddGoods() {
      this.$router.push('/goods/addgoods')
    }
  }
}
</script>
<style lang="scss" scoped>
.container {
  border: 1px solid #e6ebf5;
  border-radius: 5px;
  padding: 30px 20px;
  width: 50%;
  margin: 20px auto;
}
.input-width {
  width: 60%;
}
</style>
