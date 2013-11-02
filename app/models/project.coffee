class @Project extends JSRelModel
  #for JSRelmodel start
  table_name: "projects"
  thisclass:  (params) ->
    return new Project(params)
  collection: (params) ->
    return new Projects(params)
  #for JSRelmodel end

  validate: (attrs) ->
    if _.isEmpty(attrs.name)
      return "project name must not be empty"
  is_active: (cond={}) ->
    res = false
    issues = new Issue().where({
      project_id: this.get('id')
    }).models
    for issue in issues
      if issue.is_active() and cond and cond.except_issue_id != issue.get("id")
        res = true
    return res
  issues: () ->
    return new Issue().where({
      project_id: this.get("id")
    })

class @Projects extends Backbone.Collection
  model: Project
