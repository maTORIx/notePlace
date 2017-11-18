class SearchController < ApplicationController
  def organizations
    if(params[:format] == "json")
      @orgs = Organization.search(params[:text]).records
      data = @orgs.map{|data| {id: data.id, name: data.name, description: data.description, icon: data.icon.url, image: data.image.url}}
      render json: JSON.generate(data)
    else
      gon.user_id = current_user.id
      gon.search_text = params[:text]
    end
  end
  
  def users

    if(params[:format] == "json")
      @users = UserInfo.search(params[:text]).records
      data = @users.map{|data| {id: data.id, name: data.name, description: data.description, icon: data.icon.url}}
      render json: JSON.generate(data)
    else
      gon.user_id = current_user.id
      gon.search_text = params[:text]
    end
  end
  
  def notes
    if(params[:format] == "json")
      puts "---------------"
      p params
      if params[:text].match(/^#[^\s#]+$/)
        @notes = Note.searchByTag(params[:text]).records
      else
        @notes = Note.search(params[:text]).records
      end
      
      data = @notes.map{|data| {id: data.id, title: data.title, description: data.description, user_id: data.user_id}}

      render json: JSON.generate(data)
    else
      gon.user_id = current_user.id
      gon.search_text = params[:text]
    end
  end
end
