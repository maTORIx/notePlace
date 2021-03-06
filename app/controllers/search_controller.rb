class SearchController < ApplicationController
  def organizations
    if(params[:format] == "json")
      @orgs = Organization.search(params[:text]).results.results
      data = @orgs.map{|data| {id: data.id, name: data.name, description: data.description, icon: data.icon.url, image: data.image.url}}
      render json: JSON.generate(data)
    else
      gon.user_id = current_user.id
      gon.search_text = params[:text]
    end
  end
  
  def users

    if(params[:format] == "json")
      @users = UserInfo.search(params[:text]).results.results
      data = @users.map{|data| {id: data.id, name: data.name, description: data.description, icon: data.icon.url}}
      render json: JSON.generate(data)
    else
      gon.user_id = current_user.id
      gon.search_text = params[:text]
    end
  end
  
  def notes
    if(params[:format] == "json")
      @notes = Note.search(params[:text]).results.results

      data = @notes.map{|data| {id: data.id, title: data.title, description: data.description, user_id: data.user_id}}

      render json: JSON.generate(data)
    else
      gon.user_id = current_user.id
      gon.search_text = params[:text]
    end
  end

  def user_notes
    if(params[:format] == "json")
      @user = User.find(params[:id])
      @notes = Note.searchWithUser(params[:text], @user).results.results
      render json: JSON.generate(@notes.map{|data| {id: data.id, title: data.title, description: data.description, user_id: data.user_id}})
    else
      gon.user_id = current_user.id
      gon.show_user_id = params[:id]
      gon.search_text = params[:text]
    end
  end
end
