init = () ->
  prepareShowProjects()
  prepareShowDdtIssues()
  prepareDoExport()
  prepareDoImport()
  prepareDoDownload()
  prepareDoUpload()

  @left_work_logs = new WorkLog().condition({
    order : {started_at: "desc"}
    limit : 20
  })

  new AppController().render()
  #renderCalendars()
  $(".calendar").hide()
  loopRenderWorkLogs()
  #loopFetch()

@renderWork = (issue_id) ->
  $issue_cards = $(".issue_#{issue_id} .card")
  $issue_cards.html("Stop")
  $issue_cards.removeClass("btn-primary")
  $issue_cards.addClass("btn-warning")


prepareShowProjects = () ->
  $(".show_projects").click(() ->
    $(".project").fadeIn(100)
    $(".ddt").fadeIn(100)
  )

prepareShowDdtIssues = () ->
  $(".show_ddt_issues").click(() ->
    $(".project").fadeIn(100)
    $(".issue").hide()
    $(".open").fadeIn(100)
  )

prepareDoExport = () ->
  hl.click(".do_export", (e, target)->
    result = {
      projects : db.find("projects"),
      issues   : db.find("issues"),
      work_logs: db.find("work_logs"),
      servers  : db.find("servers"),
      infos    : db.find("infos"),
    }
    blob = new Blob([JSON.stringify(result)])
    url = window.URL.createObjectURL(blob)
    d = new Date()
    caseTitle = "Timecard"
    title = caseTitle + "_" + d.getFullYear() + zp(d.getMonth()+1) + d.getDate() + ".json"
    a = $('<a id="download"></a>').text("download").attr("href", url).attr("target", '_blank').attr("download", title).hide()
    $(".do_export").after(a)
    $("#download")[0].click()
    return false
  )

prepareDoDownload = () ->
  hl.click(".do_download", (e, target)->
    $.get("/projects.json", (projects) ->
      for project in projects
        p = new Project({
          id  : project.id
          name: project.name
          url : project.url
        })
        console.log p
        p.save({nosync:true})
    )
    $.get("/issues.json", (issues) ->
      for issue in issues
        i = new Issue({
          id: issue.id
          title: issue.title
          project_id: issue.project_id
          url: issue.url
          closed_at: issue.closed_at
          will_start_at: issue.will_start_at
        })
        i.save({nosync:true})
    )
    $.get("/work_logs.json", (work_logs) ->
      for work_log in work_logs
        w = new WorkLog({
          id: work_log.id
          issue_id: work_log.issue_id
          started_at: work_log.started_at
          end_at: work_log.end_at
        })
        w.save({nosync:true})
        location.reload()
    )
  )

prepareDoUpload = () ->
  hl.click(".do_upload", (e, target)->
    data = {
      projects : db.find("projects"),
      issues   : db.find("issues"),
      work_logs: db.find("work_logs"),
    }
    for project in data.projects
      $.post("/projects", project)
    for issue in data.issues
      $.post("/issues.json", issue)
    for work_log in data.work_logs
      $.post("/work_logs.json", work_log)
    return false
  )


prepareDoImport = () ->
  hl.click(".do_import", (e, target)->
    datafile = $("#import_file").get(0).files[0]
    if datafile
      checkImport(datafile)
    else
      $("#import_file").click()
  )

  $("#import_file").change(()->
    datafile = $("#import_file").get(0).files[0]
    if datafile
      checkImport(datafile)
    else
      alert "invalid data."
  )

checkImport = (datafile) ->
  reader = new FileReader()
  reader.onload = (evt) ->
    json = JSON.parse(evt.target.result)
    result = doImport(json)
    if result
      alert "import is done."
      location.reload()
    else
      alert "import is failed."
  reader.readAsText(datafile, 'utf-8')
  return false

doImport = (json) ->
  for table_name, data of json
    db.del(table_name)
    for item in data
      if table_name == "issues"
        item.ddt_interval = 43200
      db.ins(table_name, item)
  return true

innerLink = () ->
  res = "<div class=\"innerlink\"> | "
  projects = Project.find_all
  for project in projects
    res += "<span class=\"project_#{project.id}\"><a href=\"#project_#{project.id}\">#{project.name}</a> | </span>"
  res += "</div>"
  return res


@initCards = () ->
  $all_cards = $(".card")
  $all_cards.html("S")
  $all_cards.removeClass("btn-warning")
  $all_cards.addClass("btn-primary")

@stopWorking = () ->
  new WorkLog().last().stop()
  initCards()

@startWorking = (issue_id = null) ->
  initCards()
  last = new WorkLog().last()
  if last
    if last.is_end() && issue_id
      last.start(issue_id)
    else
      if issue_id && last.get("issue_id") != issue_id
        last.stop()
        last.start(issue_id)
      else
        stopWorking()
  else
    new WorkLog().start(issue_id)

@wbr = (str="noname", num) ->
  return str.replace(RegExp("(\\w{" + num + "})(\\w)", "g"), (all,text,char) ->
    return text + "<wbr>" + char
  )

renderCalendars = () ->
  now = new Date()
  year = now.getYear() + 1900
  mon = now.getMonth() + 1
  renderCalendar("this_month", now)
  now = new Date(year, mon, 1)
  renderCalendar("next_month", now)

renderCalendar = (key, now) ->
  year = now.getYear() + 1900
  mon = now.getMonth() + 1
  day = now.getDate()
  wday = now.getDay()
  start = wday - day%7 -1
  w = 1
  $(".#{key} h2").html("#{year}-#{zp(mon)}")
  for i in [1..31]
    d = (i + start)%7 + 1
    $day = $(".#{key} table .w#{w} .d#{d}")
    $day.html(i).addClass("day#{i}")
    $day.css("background", "#fc0") if i == day && key == "this_month"
    $day.addClass("md_#{mon}_#{i}")
    w += 1 if d == 7
  renderWorkLogs()

renderWorkingLog = () ->
  last = new WorkLog().last()
  if last
    unless last.is_end()
      wl = last.toJSON()
      time = dispTime(wl)
      $(".work_log_#{wl.id} .time").html(time)
      $("#issue_#{wl.issue_id} h2 .time").html("(#{time})")
      $("#issue_#{wl.issue_id} div div .card").html("Stop")
      issue = db.one("issues", {id: wl.issue_id})
      $(".hero-unit h1").html(issue.title)
      $(".hero-unit p").html(issue.body)
    $("title").html(time)

loopRenderWorkLogs = () ->
  renderWorkingLog()
  setTimeout(()->
    loopRenderWorkLogs()
  ,1000)

loopFetch = () ->
  for server in db.find("servers")
    fetch(server)
  setTimeout(()->
    loopFetch()
  ,1000*10)

last_fetch = (sec = null) ->
  setInfo("last_fetch", sec) if sec
  info = db.one("infos", {key: "last_fetch"})
  if info then info.val else 0

@dispTime = (work_log) ->
  msec = 0
  if work_log.end_at
    sec = work_log.end_at - work_log.started_at 
  else
    sec = now() - work_log.started_at
  if sec > 3600
    hour = parseInt(sec/3600)
    min = parseInt((sec-hour*3600)/60)
    res = "#{zero(hour)}:#{zero(min)}:#{zero(sec - hour*3600 - min*60)}"
  else if sec > 60
    min = parseInt(sec/60)
    res = "#{zero(min)}:#{zero(sec - min*60)}"
  else
    res = "#{sec}秒"
  res

@dispDate = (work_log) ->
  time = new Date(work_log.started_at*1000)
  "#{time.getMonth()+1}/#{time.getDate()}"


setInfo = (key, val) ->
  info = db.one("infos", {key: key})
  if info
    info.val = val
    info = db.upd("infos", info)
  else
    info = db.ins("infos", {key: key, val: val})
  info

db = JSRel.use("crowdsourcing", {
  schema: window.schema,
  autosave: true
})

hl = {
  click: (dom, callback) ->
    $(dom).click((e)->
      callback(e)
    )
}

zero = (int) ->
  if int < 10 then "0#{int}" else int

@now = () ->
  parseInt((new Date().getTime())/1000)

uicon = "<i class=\"icon-circle-arrow-up\"></i>"

turnback = ($e) ->
  if $e.css("display") == "none" then $e.fadeIn(400) else  $e.fadeOut(400)

findWillUploads = (table_name) ->
  db.find(table_name, {server_id: null})
  #db.find(table_name, {upd_at:{gt: last_fetch()}}) #こちらにすると自分担当の物もassignee_idが上書きされてアップされてしまうので注意

pushIfHasIssue = (project, projects) ->
  if db.one("issues", {project_id: project.id})
    project.local_id = project.id
    delete project.id
    projects.push(project)
  projects

findProjectByIssue = (issue) ->
  db.one("projects", {id: issue.project_id})

findIssueByWorkLog = (work_log) ->
  db.one("issues", {id: work_log.issue_id})

forUploadIssue = (issue) ->
  project = findProjectByIssue(issue)
  if project.server_id
    issue.project_server_id = project.server_id
  issue.local_id = issue.id
  delete issue.id
  return issue

forUploadWorkLog = (work_log) ->
  issue = findIssueByWorkLog(work_log)
  if issue.server_id
    work_log.issue_server_id = issue.server_id
  work_log.local_id = work_log.id
  delete work_log.id
  return work_log

debug = (title, data=null) ->
  console.log title
  console.log data if data

window.db = db

zp = (n) ->
  if n >= 10 then n else '0' + n

addFigure = (str) ->
  num = new String(str).replace(/,/g, "")
  while num != num.replace(/^(-?\d+)(\d{3})/, "$1,$2")
    num = num.replace(/^(-?\d+)(\d{3})/, "$1,$2")
  return num

$(() ->
  init()
)
