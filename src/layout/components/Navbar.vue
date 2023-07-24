<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />
    <div class="lang-container">
      <span>{{$t('language')}}</span>
      <el-select v-model="langType" @change="selectLang" placeholder="">
        <el-option v-for="(item, index) in langTypes" :key="index" :label="item.name" :value="item.type"></el-option>
      </el-select>
    </div>
    <div class="right-menu">
      <!-- <template v-if="device!=='mobile'">
        <search id="header-search" class="right-menu-item" />

        <error-log class="errLog-container right-menu-item hover-effect" />

        <screenfull id="screenfull" class="right-menu-item hover-effect" />

        <el-tooltip content="Global Size" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip>

      </template> -->

      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <img src="@/assets/default-login.png" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/bbb/password">
            <el-dropdown-item>{{$t('sidebar.avatar.password')}}</el-dropdown-item>
          </router-link>

          <el-dropdown-item divided @click.native="userLogout">
            <span style="display:block;">{{$t('sidebar.avatar.logout')}}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import ErrorLog from '@/components/ErrorLog'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import Search from '@/components/HeaderSearch'
import { getToken, getUserId } from '@/utils/auth'

export default {
  components: {
    Breadcrumb,
    Hamburger,
    ErrorLog,
    Screenfull,
    SizeSelect,
    Search
  },
  data() {
    return {
      langType: '',
      langTypes: this.$i18ntypes
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'device'
    ])
  },
  methods: {
    selectLang(e) {
      sessionStorage.setItem('lang', e)
      window.location.reload()
    },
    toPassword() {
      this.$router.push({
        name: 'Password'
      })
    },
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    },
    userLogout() {
      this.$store.dispatch('user/resetToken')
        .then(() => {
          let pushPath = this.$store.getters.worker == 'worker' ? `/workerLogin?redirect=${this.$route.fullPath}` : `/login?redirect=${this.$route.fullPath}`
          this.$router.push(pushPath)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  .lang-container {
    position: absolute;
    top: 10px;
    right: 120px;
    span {
      color: #000;
      margin-right: 5px;
    }
    .el-select {
      border: 2px solid #000;
      border-radius: 4px;
    }
    .el-select::v-deep .el-input {
      box-sizing: content-box;
      // margin-left: 10px;
      background-color: rgba(0, 0, 0, .3);
      width: 90px;
      height: 30px;
      border-radius: 4px;
      input {
        box-sizing: border-box;
        height: 30px;
        width: 100%;
        line-height: 30px;
        padding-left: 5px;
        padding-right: 0;
      }
    }
    .el-select::v-deep .el-input__inner {
      border: none;
    }
    .el-select::v-deep .el-select__caret {
      line-height: 30px;
    }
  }
  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;
    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
.el-dropdown-menu__item {
  text-align: center!important;
}
</style>
