<template>
  <div>
    <!--  搜索栏  -->
    <el-card id="search">
      <el-row>
        <el-col :span="20">
          <el-input v-model="searchModel.courseName" placeholder="课程名" />
          <el-button type="primary" icon="el-icon-search" round @click="getCourseList">查询</el-button></el-col>
        <el-col :span="4" align="right"><el-button type="primary" icon="el-icon-plus" circle @click="openEditUI(null)" /></el-col>
      </el-row>
    </el-card>
    <!--  结果列表  -->
    <el-card>
      <el-table :data="courseList" stripe style="width: 100%">
        <el-table-column type="index" label="#" width="80">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <!--    (pageNo-1)* pagesiz +index +1      -->
            {{ (searchModel.pageNo-1)*searchModel.pageSize+scope.$index+1 }}
          </template>
        </el-table-column>

        <el-table-column prop="id" label="课程id" width="140" />
        <el-table-column prop="courseName" label="课程名" width="140" />
        <el-table-column prop="price" label="价格" width="140" />
        <el-table-column prop="description" label="描述" width="140" />
        <el-table-column prop="courseNum" label="开课人数" width="140" />
        <el-table-column prop="selectNum" label="已选人数" width="140" />
        <el-table-column prop="status" label="用户状态" width="140">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status == 1">招募中</el-tag>
            <el-tag v-else type="danger">已满</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="tname" label="教师" width="140" />
        <el-table-column prop="time" label="开课时间" />
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" circle @click="openEditUI(scope.row.id)" />
            <el-button type="danger" icon="el-icon-delete" size="mini" circle @click="deleteCourseById(scope.row)" />
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
    <!--   用户信息编辑对话框  -->
    <el-dialog :title="title" :visible.sync="dialogFormVisible" @close="clearFrom">
      <el-form ref="courseFromRef" :model="courseForm" :rules="rules">
        <el-form-item label="课程名" prop="courseName" :label-width="formLabelWidth">
          <el-input v-model="courseForm.courseName" autocomplete="off" />
        </el-form-item>

        <el-form-item v-if="courseForm.id==null || courseForm.id ==undefined " label="价格" prop="price" :label-width="formLabelWidth">
          <el-input v-model="courseForm.price" type="price" autocomplete="off" />
        </el-form-item>
        <el-form-item label="课程描述" prop="description" :label-width="formLabelWidth">
          <el-input v-model="courseForm.description" autocomplete="off" />
        </el-form-item>
        <el-form-item label="开课人数" prop="courseNum" :label-width="formLabelWidth">
          <el-input v-model="courseForm.courseNum" autocomplete="off" />
        </el-form-item>
        <el-form-item label="已选人数" prop="selectNum" :label-width="formLabelWidth">
          <el-input v-model="courseForm.selectNum" autocomplete="off" />
        </el-form-item>
        <el-form-item label="课程状态" prop="status" :label-width="formLabelWidth">
          <el-switch
            v-model="courseForm.status"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
        <el-form-item label="课程教师" prop="tname" :label-width="formLabelWidth">
          <el-input v-model="courseForm.tname" autocomplete="off" />
        </el-form-item>
        <el-form-item label="开课时间" prop="time" :label-width="formLabelWidth">
          <el-input v-model="courseForm.time" autocomplete="off" />
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveCourse">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import courseApi from '@/api/CourseManage'
export default {
  data() {
    return {
      formLabelWidth: '130px',
      courseForm: {},
      title: '',
      dialogFormVisible: false,
      total: 0,
      searchModel: {
        pageNo: 1,
        pageSize: 5
      },
      courseList: [],
      rules: {
        courseName: [
          { required: true, message: '请输入课程名', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        price: [
          { required: true, message: '请输入登录初始密码', trigger: 'blur' },
          { min: 0, max: 5, message: '长度在 0 到 5个字符', trigger: 'blur' }
        ],
        selectNum: [
          { required: true, message: '请输入开课人数', trigger: 'blur' },
          { min: 0, max: 6, message: '长度在 6 到 16 个字符', trigger: 'blur' }
        ]

      }
    }
  },
  created() {
    this.getCourseList()
  },
  methods: {
    deleteCourseById(course) {
      this.$confirm(`您确认删除课程 ${course.courseName} ?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        courseApi.deleteCourseById(course.id).then(response => {
          this.$message({
            type: 'success',
            message: response.message
          })
          this.getCourseList()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    saveCourse() {
      // 触发表单验证
      this.$refs.courseFromRef.validate((valid) => {
        if (valid) {
          // 请求提交给后台
          courseApi.saveCourse(this.courseForm).then(response => {
            // 成功提示
            this.$message({
              message: response.message,
              type: 'success'
            })
            // 关闭对话框
            this.dialogFormVisible = false
            // 刷新页面
            this.getCourseList()
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    clearFrom() {
      this.courseForm = {}
      this.$refs.courseFromRef.clearValidate()
    },
    openEditUI(id) {
      if (id == null) {
        this.title = '新增课程信息'
      } else {
        this.title = '修改课程信息'
        // 根据id查询用户数据
        courseApi.getCourseById(id).then(response => {
          this.courseForm = response.data
        })
      }
      this.dialogFormVisible = true
    },
    handleSizeChange(pageSize) {
      this.searchModel.pageSize = pageSize
      this.getCourseList()
    },
    handleCurrentChange(pageNo) {
      this.searchModel.pageNo = pageNo
      this.getCourseList()
    },
    getCourseList() {
      courseApi.getCourseList(this.searchModel).then(response => {
        this.courseList = response.data.rows
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
