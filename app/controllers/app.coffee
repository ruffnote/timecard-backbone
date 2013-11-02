class @AppController
  render: () ->
    projects = new Project().find_all()
    projectsView = new ProjectsView({
      collection: projects
    })
    $("#wrapper").html(projectsView.render().el)
    addProjectView = new AddProjectView(
      collection: projects
    )
    for project in projects.toJSON()
      issues = new Issue().where({project_id: project.id})
      issuesView = new IssuesView({
        collection: issues
      })
      $("#project_#{project.id} div .issues").html(
        issuesView.render().el
      )
      addIssueView = new AddIssueView({
        collection: issues
      })
      $("#project_#{project.id} div div.input-append").append(
        addIssueView.render().el
      )
    workLogsView = new WorkLogsView(
      collection: left_work_logs
    )
    $("#work_logs").html(
      workLogsView.render().el
    )
    last = new WorkLog().last()
    if last
      unless last.is_end()
        $issue_cards = $(".issue_#{last.get('issue_id')} .card")
        $issue_cards.html("Stop")
        $issue_cards.removeClass("btn-primary")
        $issue_cards.addClass("btn-warning")
