require 'test_helper'

class SubscribersControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get subscribers_index_url
    assert_response :success
  end

  test "should get show" do
    get subscribers_show_url
    assert_response :success
  end

  test "should get new" do
    get subscribers_new_url
    assert_response :success
  end

  test "should get create" do
    get subscribers_create_url
    assert_response :success
  end

  test "should get destroy" do
    get subscribers_destroy_url
    assert_response :success
  end

end
