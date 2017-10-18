Rails.application.routes.draw do
  resources :subscribers, except: ["edit", "update", "new"] do
    collection do
      get "search/:from/:search_id", to: "subscribers#search"
    end
  end

  resources :scopes, except: ["edit", "update", "new"]

  resources :members, except: ["edit", "update", "new"]

  get 'note_files/:id', to: "note_files#show"

  resources :notes, except: [:index]

  resources :user_infos, path: "users", except: [:create, :new, :destroy]

  resources :organizations,path: "org", except: [:delete], param: :name

  root "home#index"

  devise_for :users, path: "auth"
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html 
end
