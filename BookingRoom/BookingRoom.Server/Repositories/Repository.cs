using BookingRoom.Server.Models;
using BookingRoom.Server.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookingRoom.Server.Repositories
{
    public class Repository<T> : IRepository<T> where T : class
    {
        protected readonly HotelBookingDbContext _context;

        public Repository(HotelBookingDbContext context)
        {
            _context = context;
        }

        public virtual async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _context.Set<T>().ToListAsync();
        }

        public virtual async Task<List<T>> GetAllAsync(IQueryable<T> query)
        {
            if (query == null)
            {
                throw new ArgumentNullException(nameof(query));
            }
            return await query.ToListAsync();
        }


        public virtual async Task<T> GetByIdAsync(int id)
        {
            return await _context.Set<T>().FindAsync(id);
        }

        public virtual async Task AddAsync(T entity)
        {
            await _context.Set<T>().AddAsync(entity);
        }

        public virtual async Task UpdateAsync(T entity)
        {
            _context.Set<T>().Update(entity);
        }

        public virtual async Task DeleteAsync(int id)
        {
            var entity = await GetByIdAsync(id);
            if (entity != null)
            {
                _context.Set<T>().Remove(entity);
            }
        }
    }
}