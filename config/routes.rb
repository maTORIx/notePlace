Rails.application.routes.draw do
  resources :subscribers, except: ["edit", "update", "new"]

  resources :scopes, except: ["edit", "update", "new"]

  resources :members, except: ["edit", "update", "new"]

  resources :member_requests, except: ["edit", "update", "new"]

  resources :notes, except: [:index] do
    member do
      get "file", to: "notes#files"
    end
  end

  resources :user_infos, path: "users", except: [:create, :new, :destroy] do
    member do
      get ":type", to: "user_infos#search"
    end
  end

  resources :organizations, path: "org", except: [:delete], param: :name do
    member do
      get ":type", to: "organizations#search"
    end
  end

  root "home#index"

  devise_for :users, path: "auth"
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html 
end
