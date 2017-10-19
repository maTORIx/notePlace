require 'test_helper'

class MemberRequestsControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get member_requests_index_url
    assert_response :success
  end

  test "should get show" do
    get member_requests_show_url
    assert_response :success
  end

  test "should get create" do
    get member_requests_create_url
    assert_response :success
  end

  test "should get delete" do
    get member_requests_delete_url
    assert_response :success
  end

end
