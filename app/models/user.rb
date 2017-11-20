class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  has_one :user_info

  has_many :notes
  has_many :stars
  has_many :star_notes, through: :stars, source: :note

  has_many :members
  has_many :member_organizations, through: :members, source: :organization

  has_many :member_requests
  has_many :member_request_organizations, through: :member_requests, source: :organization

  has_many :subscribers
  has_many :subscriber_organizations, through: :subscribers, source: :organization

  has_many :scopes

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable, :confirmable
  
  def isFavorite(note)
    self.star_notes.include? note
  end

  def toMap()
    self.user_info.toMap
  end
end
