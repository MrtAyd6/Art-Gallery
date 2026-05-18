namespace Backend.Models
{
    public class Coupon
    {
        public int CouponId { get; set; }
        public string Code { get; set; }
        public int DiscountRate { get; set; }
        public int OwnerId { get; set; }
        public string CouponType { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateCouponDto
    {
        public string Code { get; set; }
        public int DiscountRate { get; set; }
        public int OwnerId { get; set; }
        public string CouponType { get; set; }
    }

    public class ValidateCouponDto
    {
        public string Code { get; set; }
        public int UserId { get; set; }
        public string PurchaseType { get; set; }
    }
}