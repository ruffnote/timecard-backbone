$('#id').focus()

$('.add_project').bind('ajax:complete', (request) ->
  location.reload()
)

class @ProjectView extends Backbone.View
  tagName: 'div'
  className: 'project'
  initialize: () ->
    this.model.on('change', this.render, this)
  events: {
    "click div a.edit": "clickEdit"
    "click div a.ddt" : "clickDdt"
  }
  clickEdit: () ->
    project = new Project().find(this.model.id)
    p = project.toJSON()
    project.set({
      name: prompt('project name', p.name)
      url : prompt('project url',  p.url)
    })
    project.save()
    $("#project_#{p.id} div h1").html(
      p.name
    )
  clickDdt: () ->
    for issue in this.model.issues().models
      issue.set_ddt() unless issue.is_ddt()
    $("#project_#{this.model.get('id')}").fadeOut(300)
  render : () ->
    $project = $tag("div")
    $project.html($tag("h1").html(this.model.toJSON().name))
    $project.append($tag("div", {class: "issues"}))
    $project.append($tag("div", {class: "input-append"}))
    $buttons = $tag("div", {class: "btn-group"})
    $buttons.append($tag("a", {class: "btn btn-warning ddt", href: "#"}).html("DDT"))
    $buttons.append($tag("a", {class: "btn btn-default edit", href: "#"}).html("Edit"))
    $project.append($buttons)
    this.$el.html($project)
    return this

class @ProjectsView extends Backbone.View
  id: "issues"
  tagName: 'div'
  initialize: () ->
    this.collection.on('add', this.addProject, this)
  addProject: (project) ->
    projectView = new ProjectView({
      model: project
      id   : "project_#{project.id}"
    })
    this.$el.prepend(projectView.render().el)
  className: "row-fluid"
  render: () ->
    this.collection.each((project) ->
      projectView = new ProjectView({
        model: project
        id   : "project_#{project.id}"
      })
      this.$el.append(projectView.render().el)
    , this)
    return this

class @AddProjectView extends Backbone.View
  el: ".add_project"
  events: {
    "click": "clicked"
  },
  clicked: (e) ->
    e.preventDefault()
    name = prompt('please input the project name', '')
    title = prompt('please input the issue title', 'add issues')
    projects = new Project().where({name: name})
    if projects.models[0]
      project = projects.models[0]
    else
      project = new Project()
    issue   = new Issue()
    if project.set({name: name}, {validate: true})
      project.save()
      this.collection.add(project)
      project_id = project.get("id")
      if issue.set({
        title     : title,
        project_id: project_id
        }, {validate: true})
        issue.save()
        issues = new Issue().where({project_id: project_id})
        issuesView = new IssuesView({
          collection: issues
        })
        $("#project_#{project.id} div .issues").html(
          issuesView.render().el
        )
        $("#project_#{project_id}").show()
        addIssueView = new AddIssueView({
          collection: issues
        })
        $("#project_#{project_id} div div.input-append").append(
          addIssueView.render().el
        )
