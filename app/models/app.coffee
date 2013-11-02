class @JSRelModel extends Backbone.Model
  initialize: () ->
    this.on('invalid', (model, error) ->
      alert(error)
    )
  save: (params=null) ->
    cond = this.toJSON()
    if this.set(cond, {validate: true})
      if cond.id && this.find(cond.id)
        p = db.upd(this.table_name, cond)
      else
        p = db.ins(this.table_name, cond)
        this.set("id", p.id)
      return if params && params.nosync
      #$.post("/#{this.table_name}.json", this.toJSON())

  find : (id) ->
    data = db.one(this.table_name, {id: id})
    return unless data
    return new this.thisclass(
      data
    )
  find_all : () ->
    res = this.collection(
      db.find(this.table_name, null, {
        order: {upd_at: "desc"}
      })
    )
    return res
  where : (cond) ->
    return this.collection(
      db.find(this.table_name, cond, {
        order: {upd_at: "desc"}
      })
    )
  condition: (cond) ->
    return this.collection(
      db.find(this.table_name, null,
        cond
      )
    )
