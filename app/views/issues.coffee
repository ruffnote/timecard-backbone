class @IssueView extends Backbone.View
  initialize: () ->
    this.model.on('change', this.updateIssue, this)
  tagName : 'div'
  className : "issue col-lg-3"
  events:{
    "click h2"            : "doOpenStart"
    "click div div .card" : "doStart"
    "click div div .cls"  : "doClose"
    "click div div .ddt"  : "doDdt"
    "click div div .edit" : "doEdit"
  }
  updateIssue: (issue) ->
    issue_id = issue.get("id")
    $("#issue_#{issue_id} h2").html(
      issue.title_with_url()
    )
    if !issue.is_active() and !issue.project().is_active({
      except_issue_id: issue_id
    })
      $("#project_#{issue.get('project_id')}").fadeOut(300)

  doOpenStart: (e) ->
    e.preventDefault()
    issue =this.model.toJSON()
    project = new Project().find(issue.project_id).toJSON()
    url = issue.url
    url = project.url if project.url and !url
    if url
      startWorking(issue.id)
      window.open(url, "issue_#{issue.id}")

  doStart: () ->
    startWorking(this.model.id)

  doClose: (e) ->
    e.preventDefault()
    issue =this.model
    unless issue.is_closed()
      issue.set_closed()
      stopWorking()
      this.$el.fadeOut(200)
    else
      issue.cancel_closed()
      this.$el.fadeIn(300)
      this.$el.css("background", "#fff")
      this.$el.find(".btn-group .cls").addClass("btn-danger")
      this.$el.find(".btn-group .cls").html("Close")

  doDdt: (e) ->
    e.preventDefault()
    issue = this.model
    unless issue.is_ddt()
      issue.set_ddt()
      stopWorking()
      this.$el.fadeOut(200)
    else
      issue.cancel_ddt()
      this.$el.css("background", "#fff")
      this.$el.find(".btn-group .ddt").addClass("btn-warning")
      this.$el.find(".btn-group .ddt").html("DDT")

  doEdit: (e) ->
    e.preventDefault()
    issue = this.model
    i = issue.toJSON()
    issue.set({
      title: prompt('issue title', i.title)
      url  : prompt('issue url',   i.url)
      #body : prompt('issue body',  i.body)
      #body : prompt('ddt_interval',  i.ddt_interval)
    })
    issue.save()

  render  : () ->
    issue = this.model.toJSON()
    $title = $tag("h2").html(this.model.title_with_url())
    $time = $tag("span", {class: "time"})
    $title.append($time)
    this.$el.append($title)

    $group = $tag("div", {class: "btn-group issue_#{issue.id}"})
    $group.append($tag("a", {class: "card btn btn-primary", href: "#"}).html("S"))
    $group.append($tag("a", {class: "ddt btn btn-warning", href: "#"}).html("D"))
    $group.append($tag("a", {class: "cls btn btn-danger", href: "#"}).html("C"))
    $group.append($tag("a", {class: "edit btn btn-default", href: "#"}).html("E"))
    $tools = $tag("div", {class: "btn-toolbar"})
    $tools.html($group)
    this.$el.append($tools)

    this.$el.append($tag("div", {class: "body"}).html(issue.body))

    if this.model.is_active()
      $("#project_#{issue.project_id}").show()
    else
      this.$el.hide()
      this.$el.css("background", "#ccc")
      if this.model.is_ddt()
        $ddt = this.$el.find(".btn-group .ddt")
        $ddt.removeClass("btn-warning")
        $ddt.html("DT")
      if this.model.is_closed()
        $cls = this.$el.find(".btn-group .cls")
        $cls.removeClass("btn-danger")
        $cls.html("Reopen")
    unless this.model.is_closed()
      this.$el.addClass("open")
    return this

class @IssuesView extends Backbone.View
  initialize: () ->
    this.collection.on('add', this.addIssue, this)
  addIssue  : (issue) ->
    issueView = new IssueView({
      model: issue
      id   : "issue_#{issue.id}"
    })
    project_id = issue.get('project_id')
    $("#project_#{project_id} div .issues").append(
      issueView.render().el
    )
    $("#project_#{issue.get('project_id')}").show()
  render : () ->
    this.collection.each((issue) ->
      issueView = new IssueView({
        model: issue
        id   : "issue_#{issue.id}"
      })
      this.$el.append(issueView.render().el)
    , this)
    return this

class @AddIssueView extends Backbone.View
  tagName  : "form"
  className: "add_issue"
  events: {
    'submit': 'submit'
  }
  submit: (e) ->
    e.preventDefault()
    $title = $(e.target).find(".input")
    title = $title.val()
    project_id = parseInt($(e.target).parent().parent().parent().attr("id").replace("project_", ""))
    issue = new Issue({
      project_id: project_id
      title     : title
    })
    issue.save()
    this.collection.add(issue)
    $title.val("")
  render: () ->
    this.$el.append($tag("input", {type: "text", class: "input"}))
    this.$el.append($tag("input", {type: "submit", value: "add issue", class: "btn"}))
    return this
