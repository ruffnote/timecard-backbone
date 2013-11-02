class @WorkLogView extends Backbone.View
  tagName: "tr"
  initialize: () ->
    this.model.on('change', this.updateWorkLog, this)
  events:{
    "click td div a.card.btn-primary": "startWorking"
    "click td div a.card.btn-warning": "stopWorking"
  }
  startWorking: (e) ->
    e.preventDefault()
    startWorking(this.model.toJSON().issue_id)
  startWorking: () ->
    startWorking(this.model.get('issue_id'))
  stopWorking: () ->
    stopWorking()
  template: _.template(
    $("#work_log-template").html()
  )
  render: () ->
    work_log = this.model.toJSON()
    data = {
      work_log : work_log
      issue    : new Issue().find(work_log.issue_id).toJSON()
    }
    template = this.template(data)
    this.$el.html(template)
    return this

class @WorkLogsView extends Backbone.View
  initialize: () ->
    left_work_logs.on('add', this.addWorkLog, this)
  addWorkLog: (work_log) ->
    workLogView = new WorkLogView({
      model: work_log
      id   : "work_log_#{work_log.id}"
    })
    $("#work_logs div:first").prepend(
      workLogView.render().el
    )
    renderWork(work_log.get('issue_id'))
  render: () ->
    this.collection.each((work_log) ->
      workLogView = new WorkLogView({
        model: work_log
        id   : "work_log_#{work_log.id}"
        className: "work_log_#{work_log.id}"
      })
      this.$el.append(workLogView.render().el)
    , this)
    return this
