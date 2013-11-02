class Issue extends JSRelModel
  table_name: "issues"
  collection: (params) ->
    return new Issues(params)

  validate: (attrs) ->
    if _.isEmpty(attrs.title)
      return "issue.title must not be empty"
  is_ddt: () ->
    wsat = this.get("will_start_at")
    return !(!wsat or wsat < now())
  set_ddt: () ->
    this.set(
      "will_start_at"
      #now() + parseInt(this.get("ddt_interval"))
      now() + parseInt(12*3600+12*3600*Math.random())
    )
    this.save()

  cancel_ddt: () ->
    this.set("will_start_at", null)
    this.save()

  is_closed: () ->
    cat = this.get("closed_at")
    return if cat > 0 then true else false

  set_closed: () ->
    this.set("closed_at", now())
    this.save()

  cancel_closed: () ->
    this.set("closed_at", 0)
    this.cancel_ddt()
    this.save()

  is_active: () ->
    return true if !this.is_closed() && !this.is_ddt()
    return false

  title_with_url: ()->
    issue = this.toJSON()
    project = this.project().toJSON()
    if issue.url
      return "<a href=\""+issue.url+"\" target=\"_blank\">"+issue.title+"</a>"
    else if project.url
      return "<a href=\""+ project.url+"\" target=\"_blank\">"+issue.title+"</a>"
    else
      return issue.title

  project: () ->
    return new Project().find(this.get("project_id"))

class Issues extends Backbone.Collection
  model: Issue

@Issue = Issue
@Issues = Issues
