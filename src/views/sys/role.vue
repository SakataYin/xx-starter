<template>
  <div>
    <!--  搜索栏  -->
    <el-card id="search">
      <el-row>
        <el-col :span="20">
          <el-input v-model="searchModel.roleName" placeholder="角色名称" />
          <el-button type="primary" icon="el-icon-search" round @click="getRoleList">查询</el-button></el-col>
        <el-col :span="4" align="right"><el-button type="primary" icon="el-icon-plus" circle @click="openEditUI(null)" /></el-col>
      </el-row>
    </el-card>
    <!--  结果列表  -->
    <el-card>
      <el-table :data="roleList" stripe style="width: 100%">
        <el-table-column type="index" label="#" width="80">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <!--    (pageNo-1)* pagesiz +index +1      -->
            {{ (searchModel.pageNo-1)*searchModel.pageSize+scope.$index+1 }}
          </template>
        </el-table-column>

        <el-table-column prop="roleId" label="角色id" width="200" />
        <el-table-column prop="roleName" label="用色名称" width="260" />
        <el-table-column prop="roleDesc" label="角色描述" />
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" circle @click="openEditUI(scope.row.roleId)" />
            <el-button type="danger" icon="el-icon-delete" size="mini" circle @click="deleteRole(scope.row)" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--  分页组件  -->
    <el-pagination
      :current-page="searchModel.pageNo"
      :page-sizes="[5, 10, 20, 30]"
      :page-size="searchModel.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <!--   角色信息编辑对话框  -->
    <el-dialog :title="title" :visible.sync="dialogFormVisible" @close="clearFrom">
      <el-form ref="roleFromRef" :model="roleForm" :rules="rules">
        <el-form-item label="角色名称" prop="roleName" :label-width="formLabelWidth">
          <el-input v-model="roleForm.roleName" autocomplete="off" />
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc" :label-width="formLabelWidth">
          <el-input v-model="roleForm.roleDesc" autocomplete="off" />
        </el-form-item>
        <el-form-item label="权限设置" prop="menuIdList" :label-width="formLabelWidth">
          <el-tree ref="menuRef" :data="menuList" :props="menuProps" show-checkbox default-expand-all node-key="menuId" style="width: 75%" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRole">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import roleApi from '@/api/RoleManage'
import menuApi from '@/api/MenuManage'
export default {
  data() {
    return {
      menuList: [],
      menuProps: {
        children: 'children',
        label: 'title'
      },
      formLabelWidth: '130px',
      roleForm: {},
      title: '',
      dialogFormVisible: false,
      total: 0,
      searchModel: {
        pageNo: 1,
        pageSize: 5
      },
      roleList: [],
      rules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20个字符', trigger: 'blur' }
        ]

      }
    }
  },
  created() {
    this.getRoleList()
    this.getAllMenu()
  },
  methods: {
    getAllMenu() {
      menuApi.getAllMenu().then(response => {
        this.menuList = response.data
      })
    },
    deleteRole(role) {
      this.$confirm(`您确认删除角色 ${role.roleName} ?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        roleApi.deleteRoleById(role.roleId).then(response => {
          this.$message({
            type: 'success',
            message: response.message
          })
          this.getRoleList()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    saveRole() {
      // 触发表单验证
      this.$refs.roleFromRef.validate((valid) => {
        if (valid) {
          const checkedKyes = this.$refs.menuRef.getCheckedKeys()
          const halfCheckedKyes = this.$refs.menuRef.getHalfCheckedKeys()
          this.roleForm.menuIdList = checkedKyes.concat(halfCheckedKyes)
          // 请求提交给后台
          roleApi.saveRole(this.roleForm).then(response => {
            // 成功提示
            this.$message({
              message: response.message,
              type: 'success'
            })
            // 关闭对话框
            this.dialogFormVisible = false
            // 刷新页面
            this.getRoleList()
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    clearFrom() {
      this.roleForm = {}
      this.$refs.roleFromRef.clearValidate()
      this.$refs.menuRef.setCheckedKeys([])
    },
    openEditUI(id) {
      if (id == null) {
        this.title = '新增角色'
      } else {
        this.title = '修改角色'
        // 根据id查询角色数据
        roleApi.getRoleById(id).then(response => {
          this.roleForm = response.data
          this.$refs.menuRef.setCheckedKeys(response.data.menuIdList)
        })
      }
      this.dialogFormVisible = true
    },
    handleSizeChange(pageSize) {
      this.searchModel.pageSize = pageSize
      this.getRoleList()
    },
    handleCurrentChange(pageNo) {
      this.searchModel.pageNo = pageNo
      this.getRoleList()
    },
    getRoleList() {
      roleApi.getRoleList(this.searchModel).then(response => {
        this.roleList = response.data.rows
        this.total = response.data.total
      })
    }
  }
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
