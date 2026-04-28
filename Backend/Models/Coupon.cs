namespace Backend.Models
{
    public class Coupon
    {
        public int CouponId { get; set; }
        public string Code { get; set; }
        public int DiscountPercentage { get; set; }
        public bool IsActive { get; set; }
    }
}