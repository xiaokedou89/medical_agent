<template>
<div class="add-category">
    <el-card class="container">
      <el-form ref="addForm" :model="addObj" :rules="rules" label-width="100px" label-position="right">
        <el-form-item :label="$t('name') + '：'" prop="name">
          <el-input v-model.trim="addObj.name" class="input-width" autocomplete="off" :placeholder="$t('rules.rolenamelongth')" />
        </el-form-item>
        <el-form-item :label="$t('description') + '：'" prop="description">
          <el-input v-model.trim="addObj.description" class="input-width" type="textarea" />
        </el-form-item>
        <el-form-item :label="$t('sort') + '：'" prop="sort">
          <el-tooltip class="item" effect="dark" :content="$t('goods.category.sortTip')" placement="top">
            <el-input-number
              v-model.trim="addObj.sort"
              size="small"
              :step="1"
              :min="0"
              :label="$t('sort')"
            />
          </el-tooltip>
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" @click="doneToCategory()">{{$t('confirmBtn')}}</el-button>
          <el-button size="small" @click="backToCategory">{{$t('confirmBtn')}}</el-button>
        </el-form-item>
        <!-- </div> -->
      </el-form>
    </el-card>
</div>
</template>
<script>
import * as rule from '@/utils/rules'
import * as api from '@/api/Goods/goods.js'
const rules = {
    name: rule.rolenameRules,
    description: rule.descriptionRules,
    sort: rule.areaRules
}
export default {
    name: 'AddCategory',
    data() {
        return {
            addFlag: false,
            rules,
            addObj: {
                id: null,
                name: '',
                description: '',
                sort: 0
            }
        }
    },
    methods: {
        doneToCategory() {
          if (this.addFlag) {
            return
          }
          this.addFlag = true
          this.$refs.addForm.validate(valid => {
            if (valid) {
              api.addGoodsCategory(this.addObj)
                .then(res => {
                  if (res.code === 20000) {
                    this.addFlag = false
                    this.$message({
                      message: this.$t('addSucMes'),
                      type: 'success',
                      duration: 1500
                    })
                  this.$router.push('/goods/category')
                  }
                })
                .catch(err => {
                  this.addFlag = false
                  this.$message({
                    message: err,
                    type: 'error',
                    duration: 1500
                  })
                })
            } else {
              this.addFlag = false
              this.$message({
                message: this.$t('validFailMes'),
                type: 'error',
                duration: 1500
              })
            }
          })

        },
        backToCategory() {
            this.$router.push('/goods/category')
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
