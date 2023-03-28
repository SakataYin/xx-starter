import request from '@/utils/request'

export default {
  getCourseList(searchModel) {
    return request({
      url: '/course/list',
      method: 'get',
      params: {
        pageNo: searchModel.pageNo,
        pageSize: searchModel.pageSize,
        courseName: searchModel.courseName
      }
    })
  },
  addCourse(course) {
    return request({
      url: '/course',
      method: 'post',
      data: course
    })
  },
  updateCourse(course) {
    return request({
      url: '/course',
      method: 'put',
      data: course
    })
  },
  saveCourse(course) {
    if (course.id == null && course.id == undefined) {
      return this.addCourse(course)
    } else {
      return this.updateCourse(course)
    }
  },
  getCourseById(id) {
    return request({
      url: '/course/' + id,
      method: 'get'
    })
  },
  deleteCourseById(id) {
    return request({
      url: '/course/' + id,
      method: 'delete'
    })
  }
}
