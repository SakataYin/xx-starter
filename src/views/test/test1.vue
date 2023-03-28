<template>
  <div>
    <!--  搜索栏  -->
    <el-card id="search">
      <el-row>
        <el-col :span="20">
          <el-input v-model="searchModel.username" placeholder="用户名" />
          <el-input v-model="searchModel.phone" placeholder="电话" />
          <el-button type="primary" icon="el-icon-search" round @click="getUserList">查询</el-button></el-col>
        <el-col :span="4" align="right"><el-button type="primary" icon="el-icon-plus" circle @click="openEditUI(null)" /></el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
  export default {

  }
</script>

<style>
  #search .el-input{
    width: 200px;
    margin-right: 10px;
  }
  .el-dialog .el-input{
    width: 75%;
  }

</style>
