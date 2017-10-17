class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  has_one :user_info
  has_many :notes
  has_many :members
  has_many :organizations, through: :members
  has_many :subscribers
  has_many :organizations, through: :subscribers
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable, :confirmable
end
