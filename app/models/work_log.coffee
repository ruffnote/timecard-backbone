class @WorkLog extends JSRelModel
  table_name: "work_logs"
  collection: (params) ->
    return new WorkLogs(params)

  last: () ->
    res = this.condition({
      limit: 1
      order: {id: "desc"}
    })
    if typeof(res.models[0]) == "undefined"
      return null
    else
      return res.models[0]
 
  is_end: () ->
    if this.get("end_at")
      return true
    return false

  start: (issue_id) ->
    initCards()
    work_log = new WorkLog({
      issue_id: issue_id
      started_at: now()
    })
    work_log.save()
    renderWork(issue_id)
    left_work_logs.add(work_log)

  stop: () ->
    initCards()
    this.set("end_at", now())
    this.save()
    $("title").html("MNG")

class @WorkLogs extends Backbone.Collection
  model: WorkLog
